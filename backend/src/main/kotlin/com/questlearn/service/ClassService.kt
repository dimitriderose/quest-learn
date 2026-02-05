package com.questlearn.service

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.questlearn.model.Class
import com.questlearn.model.ClassStats
import com.questlearn.model.RosterEntry
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ClassService(
    private val firestore: Firestore
) {
    
    /**
     * Create a new class
     */
    suspend fun createClass(clazz: Class): Class {
        val id = clazz.id.ifBlank { "class_${UUID.randomUUID()}" }
        val classCode = generateClassCode(clazz.teacherName)
        
        val newClass = clazz.copy(
            id = id,
            classCode = classCode,
            createdAt = Timestamp.now(),
            updatedAt = Timestamp.now()
        )
        
        firestore.collection("classes").document(id).set(newClass).get()
        return newClass
    }
    
    /**
     * Get class by ID
     */
    suspend fun getClass(id: String): Class? {
        val doc = firestore.collection("classes").document(id).get().get()
        return if (doc.exists()) doc.toObject(Class::class.java) else null
    }
    
    /**
     * Get all classes for a teacher
     */
    suspend fun getTeacherClasses(teacherId: String): List<Class> {
        val snapshot = firestore.collection("classes")
            .whereEqualTo("teacherId", teacherId)
            .whereEqualTo("archived", false)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .get()
            .get()
        
        return snapshot.documents.mapNotNull { it.toObject(Class::class.java) }
    }
    
    /**
     * Get class by code
     */
    suspend fun getClassByCode(code: String): Class? {
        val snapshot = firestore.collection("classes")
            .whereEqualTo("classCode", code)
            .limit(1)
            .get()
            .get()
        
        return snapshot.documents.firstOrNull()?.toObject(Class::class.java)
    }
    
    /**
     * Add student to roster
     */
    suspend fun addStudentToRoster(classId: String, entry: RosterEntry): Class? {
        val clazz = getClass(classId) ?: return null
        val updatedRoster = clazz.roster + entry
        
        val updates = mapOf(
            "roster" to updatedRoster,
            "updatedAt" to Timestamp.now()
        )
        
        return updateClass(classId, updates)
    }
    
    /**
     * Update class
     */
    suspend fun updateClass(id: String, updates: Map<String, Any>): Class? {
        val updatedMap = updates.toMutableMap()
        updatedMap["updatedAt"] = Timestamp.now()
        
        firestore.collection("classes").document(id).update(updatedMap).get()
        return getClass(id)
    }
    
    /**
     * Update class stats
     */
    suspend fun updateClassStats(id: String, stats: ClassStats): Class? {
        val updates = mapOf(
            "stats" to stats,
            "updatedAt" to Timestamp.now()
        )
        return updateClass(id, updates)
    }
    
    /**
     * Archive class
     */
    suspend fun archiveClass(id: String): Class? {
        val updates = mapOf(
            "archived" to true,
            "archivedAt" to Timestamp.now(),
            "updatedAt" to Timestamp.now()
        )
        return updateClass(id, updates)
    }
    
    /**
     * Generate unique class code
     */
    private fun generateClassCode(teacherName: String): String {
        val prefix = teacherName.split(" ").firstOrNull()?.take(6)?.uppercase() ?: "CLASS"
        val suffix = (1000..9999).random()
        return "${prefix}${suffix}"
    }
}