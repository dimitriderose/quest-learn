package com.questlearn.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.questlearn.model.Alert
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

@Service
class SseEmitterService(
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(SseEmitterService::class.java)

    // teacherId -> list of active SseEmitters (multiple tabs)
    private val emitters = ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>>()

    companion object {
        const val SSE_TIMEOUT_MS = 30 * 60 * 1000L // 30 minutes
    }

    fun createEmitter(teacherId: String): SseEmitter {
        val emitter = SseEmitter(SSE_TIMEOUT_MS)

        val teacherEmitters = emitters.computeIfAbsent(teacherId) { CopyOnWriteArrayList() }
        teacherEmitters.add(emitter)

        val cleanup = Runnable {
            teacherEmitters.remove(emitter)
            if (teacherEmitters.isEmpty()) {
                emitters.remove(teacherId)
            }
            logger.debug("SSE emitter removed for teacher $teacherId. Active: ${teacherEmitters.size}")
        }

        emitter.onCompletion(cleanup)
        emitter.onTimeout(cleanup)
        emitter.onError { cleanup.run() }

        // Send initial connection event
        try {
            emitter.send(
                SseEmitter.event()
                    .name("connected")
                    .data("""{"status":"connected"}""")
            )
        } catch (e: Exception) {
            logger.warn("Failed to send initial SSE event to teacher $teacherId")
            teacherEmitters.remove(emitter)
        }

        logger.info("SSE emitter created for teacher $teacherId. Total: ${teacherEmitters.size}")
        return emitter
    }

    fun sendAlertToTeacher(teacherId: String, alert: Alert) {
        val teacherEmitters = emitters[teacherId] ?: return
        val alertJson = objectMapper.writeValueAsString(alert)

        val deadEmitters = mutableListOf<SseEmitter>()

        for (emitter in teacherEmitters) {
            try {
                emitter.send(
                    SseEmitter.event()
                        .name("alert")
                        .data(alertJson)
                )
            } catch (e: Exception) {
                deadEmitters.add(emitter)
            }
        }

        teacherEmitters.removeAll(deadEmitters.toSet())
        if (teacherEmitters.isEmpty()) {
            emitters.remove(teacherId)
        }
    }

    @Scheduled(fixedRate = 30_000)
    fun sendHeartbeats() {
        val deadTeachers = mutableListOf<String>()

        for ((teacherId, teacherEmitters) in emitters) {
            val deadEmitters = mutableListOf<SseEmitter>()

            for (emitter in teacherEmitters) {
                try {
                    emitter.send(
                        SseEmitter.event()
                            .name("heartbeat")
                            .data("""{"timestamp":${System.currentTimeMillis()}}""")
                    )
                } catch (e: Exception) {
                    deadEmitters.add(emitter)
                }
            }

            teacherEmitters.removeAll(deadEmitters.toSet())
            if (teacherEmitters.isEmpty()) {
                deadTeachers.add(teacherId)
            }
        }

        deadTeachers.forEach { emitters.remove(it) }
    }

    fun getActiveConnectionCount(): Int {
        return emitters.values.sumOf { it.size }
    }
}
