import { useState } from "react"

function createIngredient() {
  return {
    id: crypto.randomUUID(),
    name: "",
    quantity: "",
    unit: "",
  }
}

function MealBank() {
  const [mealName, setMealName] = useState("")
  const [ingredients, setIngredients] = useState([createIngredient()])
  const [meals, setMeals] = useState([])

  function handleIngredientChange(id, field, value) {
    setIngredients((currentIngredients) =>
      currentIngredients.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, [field]: value }
          : ingredient
      )
    )
  }

  function addIngredient() {
    setIngredients((currentIngredients) => [
      ...currentIngredients,
      createIngredient(),
    ])
  }

  function removeIngredient(id) {
    setIngredients((currentIngredients) =>
      currentIngredients.filter((ingredient) => ingredient.id !== id)
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newMeal = {
      id: crypto.randomUUID(),
      name: mealName,
      ingredients,
    }

    setMeals((currentMeals) => [...currentMeals, newMeal])

    setMealName("")
    setIngredients([createIngredient()])
  }

  return (
    <main>
      <section className="page-heading">
        <h1>Meal Bank</h1>
        <p>Save your favorite meals and everything needed to make them.</p>
      </section>

      <form className="meal-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="meal-name">Meal name</label>

          <input
            id="meal-name"
            type="text"
            value={mealName}
            onChange={(event) => setMealName(event.target.value)}
            placeholder="Chicken tacos"
            required
          />
        </div>

        <div className="ingredients-heading">
          <h2>Ingredients</h2>

          <button
            className="button secondary-button"
            type="button"
            onClick={addIngredient}
          >
            + Add ingredient
          </button>
        </div>

        <div className="ingredient-list">
          {ingredients.map((ingredient, index) => (
            <div className="ingredient-row" key={ingredient.id}>
              <div className="form-group ingredient-name">
                <label htmlFor={`ingredient-${ingredient.id}`}>
                  Ingredient {index + 1}
                </label>

                <input
                  id={`ingredient-${ingredient.id}`}
                  type="text"
                  value={ingredient.name}
                  onChange={(event) =>
                    handleIngredientChange(
                      ingredient.id,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Chicken breast"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`quantity-${ingredient.id}`}>Quantity</label>

                <input
                  id={`quantity-${ingredient.id}`}
                  type="text"
                  value={ingredient.quantity}
                  onChange={(event) =>
                    handleIngredientChange(
                      ingredient.id,
                      "quantity",
                      event.target.value
                    )
                  }
                  placeholder="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`unit-${ingredient.id}`}>Unit</label>

                <input
                  id={`unit-${ingredient.id}`}
                  type="text"
                  value={ingredient.unit}
                  onChange={(event) =>
                    handleIngredientChange(
                      ingredient.id,
                      "unit",
                      event.target.value
                    )
                  }
                  placeholder="lb"
                />
              </div>

              <button
                className="button button-text"
                type="button"
                onClick={() => removeIngredient(ingredient.id)}
                disabled={ingredients.length === 1}
                aria-label={`Remove ingredient ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button className="button button-primary save-meal-button" type="submit">
          Save meal
        </button>
      </form>

      <section className="saved-meals">
        <h2>Saved Meals</h2>

        {meals.length === 0 ? (
          <p>No meals have been saved yet.</p>
        ) : (
          <div className="card-grid">
            {meals.map((meal) => (
              <article className="card meal-card" key={meal.id}>
                <h3>{meal.name}</h3>

                <ul>
                  {meal.ingredients.map((ingredient) => (
                    <li key={ingredient.id}>
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default MealBank