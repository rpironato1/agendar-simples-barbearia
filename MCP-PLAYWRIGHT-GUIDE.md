# 🎯 MCP Playwright Testing Guide - All Available Tools

## 🔧 Complete List of MCP Playwright Tools Available

### Navigation Tools
```typescript
// Navigate to URLs
playwright-browser_navigate({ url: "http://localhost:8080/admin" })

// Navigation history
playwright-browser_navigate_back()
playwright-browser_navigate_forward()
```

### Page Analysis Tools
```typescript
// Best tool for UI verification - gives complete page structure
playwright-browser_snapshot()

// Screenshots for visual verification
playwright-browser_take_screenshot({ 
  filename: "admin-dashboard.png",
  fullPage: true 
})

// Console messages for debugging
playwright-browser_console_messages()

// Network requests monitoring
playwright-browser_network_requests()
```

### Interaction Tools
```typescript
// Click elements
playwright-browser_click({ 
  element: "Admin login button", 
  ref: "e34" 
})

// Type text in inputs
playwright-browser_type({ 
  element: "Email textbox", 
  ref: "e26", 
  text: "admin@demo.com" 
})

// Hover over elements
playwright-browser_hover({ 
  element: "Menu item", 
  ref: "e15" 
})

// Drag and drop
playwright-browser_drag({ 
  startElement: "Source", 
  startRef: "e10",
  endElement: "Target", 
  endRef: "e20" 
})
```

### Form Handling Tools
```typescript
// Select dropdown options
playwright-browser_select_option({ 
  element: "Plan selector", 
  ref: "e30", 
  values: ["premium"] 
})

// Press keyboard keys
playwright-browser_press_key({ key: "Enter" })
playwright-browser_press_key({ key: "Tab" })
playwright-browser_press_key({ key: "Escape" })
```

### Advanced Testing Tools
```typescript
// Execute custom JavaScript
playwright-browser_evaluate({ 
  function: "() => window.barbershopDb.getInfo()" 
})

// Wait for conditions
playwright-browser_wait_for({ 
  text: "Login successful" 
})
playwright-browser_wait_for({ 
  time: 3 
})
playwright-browser_wait_for({ 
  textGone: "Loading..." 
})
```

### Browser Management
```typescript
// Resize browser window
playwright-browser_resize({ width: 1280, height: 720 })

// Tab management
playwright-browser_tab_list()
playwright-browser_tab_new({ url: "/admin" })
playwright-browser_tab_select({ index: 1 })
playwright-browser_tab_close({ index: 0 })

// Handle dialogs/alerts
playwright-browser_handle_dialog({ 
  accept: true, 
  promptText: "Confirm action" 
})

// Close browser
playwright-browser_close()
```

## 🚀 MCP Testing Examples for SaaS Barbershop

### Example 1: Complete Admin God Dashboard Test
```typescript
// Navigate and login
await playwright-browser_navigate({ url: "http://localhost:8080/admin-login" })
await playwright-browser_type({ element: "Email", ref: "e26", text: "admin@demo.com" })
await playwright-browser_type({ element: "Password", ref: "e33", text: "admin123" })
await playwright-browser_click({ element: "Login button", ref: "e34" })

// Verify dashboard
await playwright-browser_navigate({ url: "http://localhost:8080/admin" })
await playwright-browser_snapshot() // Capture complete page state

// Test all admin tabs
await playwright-browser_click({ element: "Barbearias tab", ref: "e55" })
await playwright-browser_click({ element: "Planos tab", ref: "e59" })
await playwright-browser_click({ element: "Financeiro tab", ref: "e62" })
await playwright-browser_click({ element: "Sistema tab", ref: "e66" })

// Test database utilities
await playwright-browser_click({ element: "Verificar Base de Dados", ref: "e131" })
await playwright-browser_take_screenshot({ filename: "admin-system-verification.png" })
```

### Example 2: Barbershop Subscription Flow Test
```typescript
// Start subscription flow
await playwright-browser_navigate({ url: "http://localhost:8080/barbershop-signup" })
await playwright-browser_snapshot() // Capture initial state

// Select Premium plan
await playwright-browser_click({ element: "Premium plan", ref: "e47" })

// Fill barbershop information
await playwright-browser_type({ element: "Nome da Barbearia", ref: "e107", text: "Test Barbershop" })
await playwright-browser_type({ element: "Proprietário", ref: "e110", text: "Test Owner" })
await playwright-browser_type({ element: "Email", ref: "e113", text: "test@example.com" })
await playwright-browser_type({ element: "Telefone", ref: "e116", text: "(11) 99999-9999" })

// Continue to next step
await playwright-browser_click({ element: "Próximo Passo", ref: "e124" })

// Complete account creation
await playwright-browser_type({ element: "Password", ref: "e138", text: "testpass123" })
await playwright-browser_type({ element: "Confirm Password", ref: "e142", text: "testpass123" })
await playwright-browser_click({ element: "Terms checkbox", ref: "e145" })
await playwright-browser_click({ element: "Criar Conta", ref: "e160" })

// Verify successful creation and redirect
await playwright-browser_wait_for({ text: "Barbearia criada com sucesso" })
await playwright-browser_snapshot() // Capture success state
```

### Example 3: Multitenancy Verification
```typescript
// Test data isolation between barbershops
await playwright-browser_navigate({ url: "http://localhost:8080/barbershop-login" })

// Login as first barbershop
await playwright-browser_type({ element: "Email", ref: "e26", text: "barbershop@demo.com" })
await playwright-browser_type({ element: "Password", ref: "e33", text: "demo123" })
await playwright-browser_click({ element: "Login", ref: "e35" })

// Verify barbershop context
await playwright-browser_wait_for({ text: "Elite Barber" })
await playwright-browser_wait_for({ text: "Plano Premium" })

// Check barbeiros tab for data isolation
await playwright-browser_click({ element: "Barbeiros tab", ref: "e124" })
await playwright-browser_snapshot() // Should show only this barbershop's data

// Logout and test session clearing
await playwright-browser_click({ element: "Sair", ref: "e77" })
await playwright-browser_wait_for({ text: "Email da Barbearia" })
```

### Example 4: Performance and Error Testing
```typescript
// Test page load performance
const startTime = Date.now()
await playwright-browser_navigate({ url: "http://localhost:8080/" })
await playwright-browser_wait_for({ text: "Elite Barber" })
const loadTime = Date.now() - startTime
console.log(`Page loaded in ${loadTime}ms`)

// Test error handling
await playwright-browser_navigate({ url: "http://localhost:8080/barbershop-login" })
await playwright-browser_type({ element: "Email", ref: "e26", text: "invalid@email.com" })
await playwright-browser_type({ element: "Password", ref: "e33", text: "wrongpassword" })
await playwright-browser_click({ element: "Login", ref: "e35" })

// Should stay on login page or show error
await playwright-browser_wait_for({ time: 2 })
await playwright-browser_snapshot() // Capture error state
```

### Example 5: Mobile Responsiveness Test
```typescript
// Test mobile viewport
await playwright-browser_resize({ width: 375, height: 667 })
await playwright-browser_navigate({ url: "http://localhost:8080/barbershop-signup" })

// Verify mobile layout
await playwright-browser_snapshot() // Mobile view of signup
await playwright-browser_scroll({ direction: "down" })

// Test plan selection on mobile
await playwright-browser_click({ element: "Premium plan", ref: "e47" })
await playwright-browser_take_screenshot({ filename: "mobile-plan-selection.png" })

// Reset to desktop
await playwright-browser_resize({ width: 1280, height: 720 })
```

## 🎯 Key MCP Testing Advantages

### 1. **Real Browser Automation**
- Tests actual user interactions
- Validates complete user flows
- Catches UI/UX issues

### 2. **Visual Verification**
- Screenshots for manual review
- Snapshots show complete page state
- Visual regression testing possible

### 3. **Comprehensive Coverage**
- Network monitoring
- Console error detection
- Performance measurement
- Cross-device testing

### 4. **Easy Debugging**
- Console messages capture
- Step-by-step execution
- Visual feedback at each step

### 5. **Production-Ready Testing**
- Tests real browser environment
- Validates actual user experience
- Catches integration issues

## 🔧 Best Practices for MCP Testing

1. **Always use playwright-browser_snapshot()** for page verification
2. **Combine multiple tools** for comprehensive testing
3. **Test error scenarios** with invalid inputs
4. **Verify responsive design** with different viewports
5. **Test performance** with timing measurements
6. **Use wait_for conditions** to handle async operations
7. **Capture screenshots** for visual evidence
8. **Monitor console messages** for JavaScript errors
9. **Test complete user flows** end-to-end
10. **Verify multitenancy** with different user contexts