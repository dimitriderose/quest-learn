package com.questlearn.model

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter
class StringListConverter : AttributeConverter<List<String>, String> {
    private val mapper = jacksonObjectMapper()
    
    override fun convertToDatabaseColumn(attribute: List<String>?): String {
        val list: List<String> = attribute ?: emptyList()
        return mapper.writeValueAsString(list)
    }
    
    override fun convertToEntityAttribute(dbData: String?): List<String> {
        if (dbData.isNullOrBlank()) {
            return emptyList()
        }
        val typeRef: TypeReference<List<String>> = object : TypeReference<List<String>>() {}
        return mapper.readValue(dbData, typeRef)
    }
}