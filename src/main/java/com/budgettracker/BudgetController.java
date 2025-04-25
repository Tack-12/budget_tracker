// BudgetController.java
package com.budgettracker;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.*;

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

    //Endpoint for allocations
    @PostMapping("/allocations")
    public Map<String,Object> setAllocations(@RequestBody Map<String, Double> alloc) {
        if (profile.getIncome() == null) {
            return Map.of("error","Please set income first");
        }
        profile.setAllocations(alloc);
        return Map.of("message","Allocations set", "allocations", alloc);
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
        summary.put("allocations", profile.getAllocations());
        Map<String, Double> remMap = new HashMap<>();
        for (var entry : profile.getAllocations().entrySet()) {
            remMap.put(entry.getKey(),
                    profile.getRemainingForCategory(entry.getKey()));
        }
        summary.put("remainingPerCategory", remMap);
        return summary;
    }

    // DELETE FUNC
    @DeleteMapping("/expense/{index}")
    public Map<String, Object> deleteExpense(@PathVariable int index) {
        if (profile.getIncome() == null) {
            return Map.of("error", "Please set income first");
        }
        var expenses = profile.getExpenses();
        if (index < 0 || index >= expenses.size()) {
            return Map.of("error", "Invalid expense index");
        }
        expenses.remove(index);
        return Map.of(
                "message",         "Expense removed",
                "totalExpenses",   profile.getTotalExpenses(),
                "remainingBudget", profile.getRemainingBudget(),
                "expenses",        profile.getExpenses()
        );
    }

    // DELETE FUNC2.0
    @DeleteMapping("/income")
    public Map<String, Object> deleteIncome() {
        profile.setIncome(null);
        profile.getExpenses().clear();
        return Map.of("message", "Income cleared");
    }

}
