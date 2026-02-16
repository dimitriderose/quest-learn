package com.questlearn.service

import com.questlearn.model.*
import com.questlearn.repository.AlertRepository
import com.questlearn.repository.NotificationPreferenceRepository
import com.questlearn.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit

@Service
class EmailNotificationService(
    private val mailSender: JavaMailSender,
    private val notificationPreferenceRepository: NotificationPreferenceRepository,
    private val userRepository: UserRepository,
    private val alertRepository: AlertRepository,
    @Value("\${questlearn.notifications.from-email:noreply@questlearn.app}")
    private val fromEmail: String,
    @Value("\${questlearn.notifications.from-name:QuestLearn}")
    private val fromName: String,
    @Value("\${questlearn.notifications.frontend-url:http://localhost:3000}")
    private val frontendUrl: String
) {
    private val logger = LoggerFactory.getLogger(EmailNotificationService::class.java)

    @Async
    fun sendAlertEmail(alert: Alert) {
        try {
            val prefs = notificationPreferenceRepository.findByTeacherId(alert.teacherId)

            // If no preferences saved, default to sending for HIGH and CRITICAL only
            val emailEnabled = prefs?.emailEnabled ?: true

            if (!emailEnabled) return

            val shouldSend = when (alert.severity) {
                AlertSeverity.CRITICAL -> prefs?.emailOnCriticalSeverity ?: true
                AlertSeverity.HIGH -> prefs?.emailOnHighSeverity ?: true
                AlertSeverity.MEDIUM -> prefs?.emailOnMediumSeverity ?: false
                AlertSeverity.LOW -> false
            }

            if (!shouldSend) return

            val teacher = userRepository.findById(alert.teacherId).orElse(null) ?: return

            val subject = buildEmailSubject(alert)
            val body = buildAlertEmailHtml(alert, teacher.displayName)

            sendHtmlEmail(teacher.email, subject, body)

            logger.info("Alert email sent to ${teacher.email} for alert ${alert.id}")
        } catch (e: Exception) {
            logger.error("Failed to send alert email for alert ${alert.id}: ${e.message}")
        }
    }

    @Scheduled(cron = "0 0 8 * * MON")
    fun sendWeeklyDigests() {
        logger.info("Starting weekly digest email job")

        val teachers = userRepository.findByRole(UserRole.TEACHER)

        for (teacher in teachers) {
            try {
                val prefs = notificationPreferenceRepository.findByTeacherId(teacher.uid)
                if (prefs != null && !prefs.weeklyDigestEnabled) continue

                val oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS)
                val weekAlerts = alertRepository.findByTeacherIdAndCreatedAtBetween(
                    teacher.uid, oneWeekAgo, Instant.now()
                )

                if (weekAlerts.isEmpty()) continue

                val subject = "QuestLearn Weekly Summary — ${weekAlerts.size} alerts this week"
                val body = buildWeeklyDigestHtml(teacher.displayName, weekAlerts)

                sendHtmlEmail(teacher.email, subject, body)

                // Update last digest timestamp
                val updatedPrefs = (prefs ?: NotificationPreference(teacherId = teacher.uid))
                    .copy(lastWeeklyDigestAt = Instant.now(), updatedAt = Instant.now())
                notificationPreferenceRepository.save(updatedPrefs)

                logger.info("Weekly digest sent to ${teacher.email}")
            } catch (e: Exception) {
                logger.error("Failed to send weekly digest to ${teacher.email}: ${e.message}")
            }
        }
    }

    private fun sendHtmlEmail(to: String, subject: String, htmlBody: String) {
        val message = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true, "UTF-8")
        helper.setFrom(fromEmail, fromName)
        helper.setTo(to)
        helper.setSubject(subject)
        helper.setText(htmlBody, true)
        mailSender.send(message)
    }

    private fun buildEmailSubject(alert: Alert): String {
        val severity = when (alert.severity) {
            AlertSeverity.CRITICAL -> "[URGENT] "
            AlertSeverity.HIGH -> "[Alert] "
            else -> ""
        }
        return "${severity}QuestLearn: ${alert.studentName} — ${alert.type.name.lowercase().replace("_", " ")}"
    }

    private fun buildAlertEmailHtml(alert: Alert, teacherName: String): String {
        val severityColor = when (alert.severity) {
            AlertSeverity.CRITICAL -> "#DC2626"
            AlertSeverity.HIGH -> "#F59E0B"
            AlertSeverity.MEDIUM -> "#3B82F6"
            AlertSeverity.LOW -> "#6B7280"
        }

        return """
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0D9488; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">QuestLearn</h1>
            </div>
            <div style="border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                <p>Hi ${teacherName},</p>
                <div style="border-left: 4px solid ${severityColor}; padding: 12px 16px; margin: 16px 0; background: #F9FAFB; border-radius: 0 4px 4px 0;">
                    <div style="font-size: 12px; font-weight: 600; color: ${severityColor}; text-transform: uppercase; margin-bottom: 4px;">
                        ${alert.severity.name} — ${alert.type.name.replace("_", " ")}
                    </div>
                    <div style="font-size: 16px; color: #111827;">${alert.message}</div>
                </div>
                <a href="${frontendUrl}/teacher/dashboard"
                   style="display: inline-block; background: #0D9488; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                    View Dashboard
                </a>
                <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px;">
                    You're receiving this because you have email notifications enabled.
                    <a href="${frontendUrl}/teacher/settings">Manage preferences</a>
                </p>
            </div>
        </body>
        </html>
        """.trimIndent()
    }

    private fun buildWeeklyDigestHtml(teacherName: String, alerts: List<Alert>): String {
        val criticalCount = alerts.count { it.severity == AlertSeverity.CRITICAL }
        val highCount = alerts.count { it.severity == AlertSeverity.HIGH }
        val mediumCount = alerts.count { it.severity == AlertSeverity.MEDIUM }
        val needsHelpStudents = alerts
            .filter { it.type == AlertType.NEEDS_HELP }
            .map { it.studentName }
            .distinct()

        val alertRows = alerts.take(10).joinToString("") { alert ->
            """<tr>
                <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${alert.studentName}</td>
                <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${alert.type.name.replace("_", " ")}</td>
                <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${alert.severity.name}</td>
            </tr>"""
        }

        return """
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0D9488; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">QuestLearn Weekly Summary</h1>
            </div>
            <div style="border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                <p>Hi ${teacherName},</p>
                <p>Here's your weekly summary:</p>

                <table style="width: 100%; margin: 16px 0;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="width: 33%; background: #FEE2E2; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #DC2626;">${criticalCount}</div>
                            <div style="font-size: 12px; color: #991B1B;">Critical</div>
                        </td>
                        <td style="width: 8px;"></td>
                        <td style="width: 33%; background: #FEF3C7; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #D97706;">${highCount}</div>
                            <div style="font-size: 12px; color: #92400E;">High</div>
                        </td>
                        <td style="width: 8px;"></td>
                        <td style="width: 33%; background: #DBEAFE; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #2563EB;">${mediumCount}</div>
                            <div style="font-size: 12px; color: #1E40AF;">Medium</div>
                        </td>
                    </tr>
                </table>

                ${if (needsHelpStudents.isNotEmpty()) "<p><strong>Students needing help:</strong> ${needsHelpStudents.joinToString(", ")}</p>" else ""}

                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    <thead>
                        <tr style="background: #F9FAFB;">
                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #E5E7EB;">Student</th>
                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #E5E7EB;">Type</th>
                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #E5E7EB;">Severity</th>
                        </tr>
                    </thead>
                    <tbody>${alertRows}</tbody>
                </table>
                ${if (alerts.size > 10) "<p style='color: #6B7280; font-size: 14px;'>...and ${alerts.size - 10} more alerts</p>" else ""}

                <a href="${frontendUrl}/teacher/dashboard"
                   style="display: inline-block; background: #0D9488; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                    View Full Dashboard
                </a>

                <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px;">
                    <a href="${frontendUrl}/teacher/settings">Manage email preferences</a>
                </p>
            </div>
        </body>
        </html>
        """.trimIndent()
    }
}
