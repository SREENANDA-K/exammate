package com.exammate;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class ApiErrors {
  private static final Logger log=LoggerFactory.getLogger(ApiErrors.class);
  @ExceptionHandler(ResponseStatusException.class)
  public org.springframework.http.ResponseEntity<Map<String,String>> status(ResponseStatusException e) {
    return org.springframework.http.ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"Request failed.":e.getReason()));
  }
  @ExceptionHandler(Exception.class)
  public org.springframework.http.ResponseEntity<Map<String,String>> other(Exception e) {
    log.error("Unhandled API error",e);
    return org.springframework.http.ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message",e.getMessage()==null?"An internal server error occurred.":e.getMessage()));
  }
}
