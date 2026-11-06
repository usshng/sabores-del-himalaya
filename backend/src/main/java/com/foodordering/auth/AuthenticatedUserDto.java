package com.foodordering.auth;

import org.springframework.security.core.Authentication;

public record AuthenticatedUserDto(String login, String role) {

    private static final String ROLE_PREFIX = "ROLE_";

    static AuthenticatedUserDto from(Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority()
                .substring(ROLE_PREFIX.length());
        return new AuthenticatedUserDto(authentication.getName(), role);
    }
}