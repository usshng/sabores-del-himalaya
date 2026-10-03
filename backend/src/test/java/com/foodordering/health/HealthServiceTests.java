package com.foodordering.health;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;

class HealthServiceTests {

    private final DataSource dataSource = mock(DataSource.class);

    private final HealthService healthService = new HealthService(dataSource);

    @Test
    void reportsDatabaseUpWhenConnectionIsValid() throws SQLException {
        Connection connection = mock(Connection.class);
        when(connection.isValid(anyInt())).thenReturn(true);
        when(dataSource.getConnection()).thenReturn(connection);

        assertThat(healthService.checkHealth()).isEqualTo(new HealthDto(ComponentStatus.UP, ComponentStatus.UP));
    }

    @Test
    void reportsDatabaseDownWhenConnectionFails() throws SQLException {
        when(dataSource.getConnection()).thenThrow(new SQLException("Connection refused"));

        assertThat(healthService.checkHealth()).isEqualTo(new HealthDto(ComponentStatus.UP, ComponentStatus.DOWN));
    }
}
