package com.foodordering.staff;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// to create one account for each role of the personal (dueno --> rol: owner, chef --> rol: chef,
// personal --> rol:staff)
@Component
@Profile("local")
public class LocalStaffAccountsLoader implements CommandLineRunner {

    private static final String LOCAL_PASSWORD = "himalaya123";

    private final StaffAccountRepository staffAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalStaffAccountsLoader(StaffAccountRepository staffAccountRepository, PasswordEncoder passwordEncoder) {
        this.staffAccountRepository = staffAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (staffAccountRepository.count() > 0) {
            return;
        }
        String passwordHash = passwordEncoder.encode(LOCAL_PASSWORD);
        staffAccountRepository.save(new StaffAccount("dueno", passwordHash, StaffRole.OWNER));
        staffAccountRepository.save(new StaffAccount("chef", passwordHash, StaffRole.CHEF));
        staffAccountRepository.save(new StaffAccount("personal", passwordHash, StaffRole.STAFF));
    }
}