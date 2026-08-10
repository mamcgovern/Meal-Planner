import { NavLink, Route, Routes } from "react-router-dom"
import MealPlan from "./pages/MealPlan"
import MealBank from "./pages/MealBank"
import Ingredients from "./pages/Ingredients"
import ShoppingList from "./pages/ShoppingList"

function App() {
  return (
    <>
      <header className="site-header">
        <NavLink className="site-title" to="/">
          Meal Planner
        </NavLink>

        <nav>
          <NavLink to="/">Meal Plan</NavLink>
          <NavLink to="/meals">Meal Bank</NavLink>
          <NavLink to="/ingredients">Ingredients</NavLink>
          <NavLink to="/shopping-list">Shopping List</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<MealPlan />} />
        <Route path="/meals" element={<MealBank />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
      </Routes>
    </>
  )
}

export default App