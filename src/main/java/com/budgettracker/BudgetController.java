// BudgetController.java
package com.budgettracker;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")
public class BudgetController {

    // In a production app, consider using a service and proper persistence.
    private BudgetProfile profile = new BudgetProfile();

    // Endpoint to set the income; this (re)initializes the BudgetProfile.
    @PostMapping("/income")
    public Map<String, Object> setIncome(@RequestBody Income income) {
        profile.setIncome(income);
        return Map.of("message", "Income set successfully", "monthlyIncome", income.getMonthlyIncome());
    }

    // Endpoint to add an expense.
    @PostMapping("/expense")
    public Map<String, Object> addExpense(@RequestBody Expense expense) {
        if (profile.getIncome() == null) {
            return Map.of("error", "Please set income first");
        }
        profile.addExpense(expense);
        return Map.of("message", "Expense added", "expense", expense);
    }

    // Endpoint to get a summary of the budget.
    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        if (profile.getIncome() == null) {
            return Map.of("error", "Income not set");
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("monthlyIncome", profile.getIncome().getMonthlyIncome());
        summary.put("totalExpenses", profile.getTotalExpenses());
        summary.put("remainingBudget", profile.getRemainingBudget());
        summary.put("expenses", profile.getExpenses());
        return summary;
    }
}
