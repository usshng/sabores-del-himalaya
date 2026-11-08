package com.foodordering.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// For the time, we use the system clock of the computer where the backend runs.
// So if any customer changes their own system time, can't cheat the 10 minute limit
// as the real clock is from our computer that runs the backend.
//
@Configuration
public class ClockConfig {
    // we will use it for 10 minutes cancellation period (US-16) with a fixed time
    // so we don't need to wait real 10 minutes.
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}