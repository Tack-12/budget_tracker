// BudgetController.java
package com.budgettracker;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")
public class BudgetController {
    private BudgetProfile profile;

    @PostMapping("/income")
    public void setIncome(@RequestBody Income income) {
        profile = new BudgetProfile(income);
    }

    @PostMapping("/expense")
    public void addExpense(@RequestBody Expense expense) {
        if (profile != null) profile.addExpense(expense);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        if (profile == null) return Map.of("error", "Income not set");

        Map<String, Object> summary = new HashMap<>();
        summary.put("monthlyIncome", profile.getIncome().getMonthlyIncome());
        summary.put("totalExpenses", profile.getTotalExpenses());
        summary.put("remaining", profile.getRemainingBudget());
        summary.put("expenses", profile.getExpenses());
        return summary;
    }
}
