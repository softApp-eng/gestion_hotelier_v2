package com.softappeng.hotelv2.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jackson configuration: ISO dates + tolerant deserialization.
 *
 * <p>Important: the API returns enriched / derived fields (e.g. {@code Gouvernante.nomComplet})
 * that have a getter but no setter. Without ignoring unknown properties, sending such an object
 * back (room edit, gouvernante edit…) fails with HTTP 400
 * ({@code Unrecognized field "nomComplet"}). We therefore ignore unknown properties on input.</p>
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.findAndRegisterModules();
        // Serialize dates as ISO-8601 strings (not as numeric timestamps/arrays).
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // Tolerate extra fields coming from the frontend (derived / read-only properties).
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        return mapper;
    }
}
