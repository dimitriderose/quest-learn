package com.questlearn.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val oauth2AuthenticationSuccessHandler: OAuth2AuthenticationSuccessHandler,
    private val oauth2AuthenticationFailureHandler: OAuth2AuthenticationFailureHandler,
    @Value("\${questlearn.cors.allowed-origins}")
    private val allowedOrigins: String
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            // Disable X-Frame-Options to allow quest HTML to load in iframes
            .headers { headers ->
                headers.frameOptions { it.disable() }
            }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/health", "/actuator/**").permitAll()
                    .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/login/student").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/auth/me").authenticated()
                    // Allow quest HTML endpoint to be accessed without authentication (for iframe)
                    .requestMatchers(HttpMethod.GET, "/api/v1/quests/*/html").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/quests/**").permitAll()
                    .requestMatchers("/api/quests/generate").permitAll()  // Allow unauthenticated quest generation for testing
                    .requestMatchers("/api/v1/teacher/**").hasRole("TEACHER")
                    .requestMatchers("/api/v1/student/**").hasRole("STUDENT")
                    .requestMatchers("/api/v1/students/**").authenticated()
                    .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                    .anyRequest().authenticated()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .successHandler(oauth2AuthenticationSuccessHandler)
                    .failureHandler(oauth2AuthenticationFailureHandler)
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = allowedOrigins.split(",").map { it.trim() }
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
