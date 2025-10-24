package pt.isec.literaturereviewhelper.controllers;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebInputException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ---------------- WebClient API errors ----------------
    @ExceptionHandler(WebClientResponseException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleWebClientResponseException(WebClientResponseException ex) {
        // Occurs when an HTTP request made via WebClient returns a non-2xx status
        Map<String, String> error = new HashMap<>();
        error.put("status", String.valueOf(ex.getStatusCode().value()));
        error.put("error", ex.getStatusText());
        error.put("body", ex.getResponseBodyAsString());
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    // ---------------- Spring WebFlux annotation validation errors ----------------
    @ExceptionHandler(WebExchangeBindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(WebExchangeBindException ex) {
        // Occurs when @NotBlank, @Min, @Max annotations fail during request parameter binding
        Map<String, Object> errors = new HashMap<>();
        ex.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    // ---------------- Manually thrown IllegalArgumentException ----------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        // Occurs when your code explicitly throws an IllegalArgumentException
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    // ---------------- Handles type mismatches and missing parameters (Strings and Integers) ----------------
    @ExceptionHandler(ServerWebInputException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleInvalidOrMissingParams(ServerWebInputException ex) {
        // Occurs when a request parameter cannot be converted to the required type or is empty
        Map<String, String> errors = new HashMap<>();
        String paramName = ex.getMethodParameter() != null
                ? ex.getMethodParameter().getParameterName()
                : "unknown";
        String expectedType = ex.getMethodParameter() != null
                ? ex.getMethodParameter().getParameterType().getSimpleName()
                : "unknown";

        Throwable cause = ex.getMostSpecificCause();
        if (cause != null) {
            String msg = cause.getMessage() != null ? cause.getMessage() : "";

            if (msg.contains("For input string")) {
                // Happens when a numeric parameter (Integer/Float) receives a non-numeric string
                String invalidValue = "";
                String[] parts = msg.split(":");
                if (parts.length > 1) {
                    invalidValue = parts[1].trim().replace("\"", "");
                }
                errors.put(paramName, String.format("Invalid value '%s'. Expected type: %s", invalidValue, expectedType));
            } else if (msg.contains("Required request parameter") || msg.contains("converted to null")) {
                // Happens when a required parameter is missing or empty
                errors.put(paramName, String.format("Invalid value ''. Expected type: %s", expectedType));
            } else {
                // Any other conversion or binding issue
                errors.put(paramName, String.format("Invalid value. Expected type: %s", expectedType));
            }
        } else {
            // Fallback when exception cause is null
            errors.put(paramName, String.format("Invalid value. Expected type: %s", expectedType));
        }

        return ResponseEntity.badRequest().body(errors);
    }

    // ---------------- Missing parameters handled by Spring ----------------
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleMissingParams(MissingServletRequestParameterException ex) {
        // Occurs when a request completely omits a required parameter
        Map<String, String> errors = new HashMap<>();
        String paramName = ex.getParameterName();
        String expectedType = ex.getParameterType();
        errors.put(paramName, String.format("Invalid value ''. Expected type: %s", expectedType));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        // Happens when a request parameter cannot be converted to the required Java type
        Map<String, String> errors = new HashMap<>();
        String paramName = ex.getName();
        String invalidValue = ex.getValue() != null ? ex.getValue().toString() : "";
        String expectedType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        errors.put(paramName, String.format("Invalid value '%s'. Expected type: %s", invalidValue, expectedType));
        return ResponseEntity.badRequest().body(errors);
    }

    // ---------------- Jakarta Bean Validation violations ----------------
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleConstraintViolation(ConstraintViolationException ex) {
        // Occurs when a validated value (e.g., @NotBlank, @Min) violates its constraints outside binding
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(cv -> {
            String fullPath = cv.getPropertyPath().toString(); // e.g., "searchSpringer.s"
            String paramName;
            if (fullPath.contains(".")) {
                String[] parts = fullPath.split("\\.");
                paramName = parts[parts.length - 1]; // get last segment, e.g., "s"
            } else {
                paramName = fullPath; // fallback
            }
            errors.put(paramName, cv.getMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }
}

