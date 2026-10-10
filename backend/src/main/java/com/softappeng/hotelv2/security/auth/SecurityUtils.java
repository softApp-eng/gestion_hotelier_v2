package com.softappeng.hotelv2.security.auth;

import com.softappeng.hotelv2.security.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Convenience helper to access the currently authenticated user.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }

    public static String currentUsername() {
        User user = currentUser();
        return user != null ? user.getUsername() : "system";
    }
}
