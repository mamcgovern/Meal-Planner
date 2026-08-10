import { useEffect, useState } from "react"
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase"

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
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const mealsQuery = query(
            collection(db, "meals"),
            orderBy("name")
        )

        const unsubscribe = onSnapshot(
            mealsQuery,
            (snapshot) => {
                const savedMeals = snapshot.docs.map((document) => ({
                    id: document.id,
                    ...document.data(),
                }))

                setMeals(savedMeals)
                setIsLoading(false)
            },
            (firebaseError) => {
                console.error(firebaseError)
                setError("We couldn't load your saved meals.")
                setIsLoading(false)
            }
        )

        return unsubscribe
    }, [])

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

    async function handleSubmit(event) {
        event.preventDefault()

        setIsSaving(true)
        setError("")

        const cleanedIngredients = ingredients.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name.trim(),
            quantity: ingredient.quantity.trim(),
            unit: ingredient.unit.trim(),
        }))

        try {
            await addDoc(collection(db, "meals"), {
                name: mealName.trim(),
                ingredients: cleanedIngredients,
                createdAt: serverTimestamp(),
            })

            setMealName("")
            setIngredients([createIngredient()])
        } catch (firebaseError) {
            console.error(firebaseError)
            setError("We couldn't save this meal. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }



    return (
        <main>
            <section className="page-heading">
                <h1>Meal Bank</h1>
                <p>Save your favorite meals and everything needed to make them.</p>
            </section>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

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

                <button
                    className="button button-primary save-meal-button"
                    type="submit"
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save meal"}
                </button>
            </form>

            <section className="saved-meals">
                <h2>Saved Meals</h2>

                {isLoading ? (
                    <p>Loading meals...</p>
                ) : meals.length === 0 ? (
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