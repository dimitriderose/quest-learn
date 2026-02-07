package com.questlearn.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter
class StringListConverter : AttributeConverter<List<String>, String> {
    private val mapper = jacksonObjectMapper()
    
    override fun convertToDatabaseColumn(attribute: List<String>?): String {
        return mapper.writeValueAsString(attribute ?: emptyList())
    }
    
    override fun convertToEntityAttribute(dbData: String?): List<String> {
        return if (dbData.isNullOrBlank()) emptyList() 
               else mapper.readValue(dbData)
    }
}
