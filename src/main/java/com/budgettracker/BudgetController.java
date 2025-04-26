package com.budgettracker;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")
public class BudgetController {

    // In-memory profile (no DB/auth)
    private BudgetProfile profile = new BudgetProfile();

    /**
     * Set or update income (with date).
     */
    @PostMapping("/income")
    public Map<String, Object> setIncome(@RequestBody Income income) {
        profile.setIncome(income);
        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Income set successfully");
        // Use income.getMonthlyIncome() directly since income is non-null
        resp.put("monthlyIncome", income.getMonthlyIncome());
        resp.put("incomeDate", income.getDate());
        return resp;
    }

    /**
     * Add an expense (with date). Income must be set first.
     */
    @PostMapping("/expense")
    public Map<String, Object> addExpense(@RequestBody Expense expense) {
        if (profile.getIncome() == null) {
            return Map.of("error", "Please set income first");
        }
        profile.addExpense(expense);
        return Map.of("message", "Expense added successfully");
    }

    /**
     * Summary endpoint, returns income, dates, totals, and expense list.
     */
    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> resp = new HashMap<>();
        // Safely get monthly income, default to 0 if income is not set
        resp.put("monthlyIncome", profile.getIncome() != null ? profile.getIncome().getMonthlyIncome() : 0);
        resp.put("incomeDate",     profile.getIncome() != null ? profile.getIncome().getDate() : null);
        resp.put("totalExpenses",  profile.getTotalExpenses());
        resp.put("remainingBudget", profile.getRemainingBudget());
        resp.put("expenses",       profile.getExpenses());
        return resp;
    }

    /**
     * Remove one expense by its index.
     */
    @DeleteMapping("/expense/{index}")
    public Map<String, Object> deleteExpense(@PathVariable int index) {
        profile.getExpenses().remove(index);
        return Map.of("message", "Expense removed");
    }

    /**
     * Clear income and all expenses.
     */
    @DeleteMapping("/income")
    public Map<String, Object> deleteIncome() {
        profile.setIncome(null);
        profile.getExpenses().clear();
        return Map.of("message", "Income cleared");
    }
}
