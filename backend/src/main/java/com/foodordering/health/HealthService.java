package com.foodordering.health;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(HealthService.class);

    private static final int DATABASE_VALIDATION_TIMEOUT_SECONDS = 2;

    private final DataSource dataSource;

    public HealthService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Checks the backend and the database connection.
     *
     * @return the status of each component; the backend is always up, since it is the one answering
     */
    public HealthDto checkHealth() {
        return new HealthDto(ComponentStatus.UP, checkDatabase());
    }

    private ComponentStatus checkDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(DATABASE_VALIDATION_TIMEOUT_SECONDS) ? ComponentStatus.UP : ComponentStatus.DOWN;
        } catch (SQLException exception) {
            // Logged so a wrong URL or bad credentials can be diagnosed from the backend console.
            LOGGER.warn("Database health check failed: {}", exception.getMessage());
            return ComponentStatus.DOWN;
        }
    }
}
