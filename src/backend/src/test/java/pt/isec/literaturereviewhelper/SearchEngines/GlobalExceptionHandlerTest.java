package pt.isec.literaturereviewhelper.SearchEngines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebInputException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import pt.isec.literaturereviewhelper.controllers.GlobalExceptionHandler;

import java.util.Collections;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleWebClientResponseException() {
        WebClientResponseException ex = new WebClientResponseException(
                500, "Internal Server Error", null,
                "Something went wrong".getBytes(), null
        );

        var response = handler.handleWebClientResponseException(ex);

        assertEquals(500, response.getStatusCodeValue());
        Map<String, String> body = response.getBody();
        assertEquals("500", body.get("status"));
        assertEquals("Internal Server Error", body.get("error"));
        assertEquals("Something went wrong", body.get("body"));
    }

    @Test
    void testHandleValidationErrors() {
        var fieldError = mock(org.springframework.validation.FieldError.class);
        when(fieldError.getField()).thenReturn("q");
        when(fieldError.getDefaultMessage()).thenReturn("must not be blank");

        var ex = mock(WebExchangeBindException.class);
        when(ex.getFieldErrors()).thenReturn(Collections.singletonList(fieldError));

        var response = handler.handleValidationErrors(ex);
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("must not be blank", response.getBody().get("q"));
    }

    @Test
    void testHandleIllegalArgument() {
        var ex = new IllegalArgumentException("Invalid parameter");
        var response = handler.handleIllegalArgument(ex);
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid parameter", response.getBody().get("error"));
    }

    @Test
    void testHandleInvalidOrMissingParams_TypeMismatch() {
        // Create a cause that mimics number format error
        Throwable cause = new NumberFormatException("For input string: \"abc\"");
        ServerWebInputException ex = mock(ServerWebInputException.class);
        when(ex.getMethodParameter()).thenReturn(null);
        when(ex.getMostSpecificCause()).thenReturn(cause);

        var response = handler.handleInvalidOrMissingParams(ex);
        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody().values().iterator().next().toString().contains("Invalid value"));
    }

    @Test
    void testHandleConstraintViolation() {
        // Mock Path
        jakarta.validation.Path path = mock(jakarta.validation.Path.class);
        when(path.toString()).thenReturn("searchSpringer.s");

        // Mock ConstraintViolation
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must be >= 0");

        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));

        var response = handler.handleConstraintViolation(ex);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("must be >= 0", response.getBody().get("s"));
    }

}
