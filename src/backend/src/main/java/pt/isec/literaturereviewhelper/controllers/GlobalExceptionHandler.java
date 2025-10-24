package pt.isec.literaturereviewhelper.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebInputException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles HTTP errors returned by WebClient calls.
     * Maps the status, error message, and response body into a JSON map.
     *
     * @param ex the exception thrown by WebClient
     * @return ResponseEntity with status code, error text, and body content
     */

    @ExceptionHandler(WebClientResponseException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleWebClientResponseException(WebClientResponseException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("status", String.valueOf(ex.getStatusCode()));
        error.put("error", ex.getStatusText());
        error.put("body", ex.getResponseBodyAsString());
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }
    /**
     * Handles validation errors triggered by Spring's annotation-based validation
     * (e.g., @NotBlank, @Min) when binding request parameters.
     * Collects all field-specific errors and returns them as a map.
     *
     * @param ex the exception containing field validation errors
     * @return ResponseEntity mapping each invalid field to its error message
     */

    @ExceptionHandler(WebExchangeBindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(WebExchangeBindException ex) {
        Map<String, Object> errors = new HashMap<>();
        ex.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Handles manually thrown IllegalArgumentExceptions.
     * Useful for business logic or parameter checks where annotation-based
     * validation does not apply.
     *
     * @param ex the exception containing the error message
     * @return ResponseEntity with the error message and 400 BAD REQUEST
     */

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    /**
     * Handles missing or invalid request parameters in WebFlux.
     * This includes:
     * 1. Type mismatches (e.g., passing a string where an int is expected)
     * 2. Missing required parameters
     *
     * The response maps the parameter name to a clear error message.
     *
     * @param ex the exception containing invalid or missing input details
     * @return ResponseEntity with a map of parameter names to error messages
     */


    @ExceptionHandler(ServerWebInputException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleInvalidOrMissingParams(ServerWebInputException ex) {
        Map<String, String> errors = new HashMap<>();

        // Get parameter name and expected type
        String paramName = ex.getMethodParameter() != null
                ? ex.getMethodParameter().getParameterName()
                : "unknown";
        String expectedType = ex.getMethodParameter() != null
                ? ex.getMethodParameter().getParameterType().getSimpleName()
                : "unknown";

        Throwable cause = ex.getMostSpecificCause();

        if (cause.getMessage() != null && cause.getMessage().contains("For input string")) {
            // Type mismatch: extract the invalid value
            String invalidValue = cause.getMessage().split(":")[1].trim().replace("\"", "");
            errors.put(paramName, String.format("Invalid value '%s'. Expected type: %s", invalidValue, expectedType));
        } else {
            // Treat missing or other invalid input as empty string
            errors.put(paramName, String.format("Invalid value ''. Expected type: %s", expectedType));
        }

        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Handles violations of Jakarta Bean Validation constraints.
     * This occurs when constraints like @NotBlank, @Min, @Max fail outside of parameter binding,
     * such as in manually validated objects or method-level validation.
     *
     * @param ex the exception containing all constraint violations
     * @return ResponseEntity mapping each property path to its validation message
     */

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleConstraintViolation(jakarta.validation.ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(cv -> {
            // Extract only the last node in the property path (i.e., the parameter name)
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
