import { useEffect, useState } from "react"
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { db } from "../firebase"

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

function createEmptyPlan() {
  return DAYS.reduce((plan, day) => {
    plan[day] = ""
    return plan
  }, {})
}

function getMonday(date = new Date()) {
  const monday = new Date(date)
  const day = monday.getDay()
  const difference = day === 0 ? -6 : 1 - day

  monday.setDate(monday.getDate() + difference)
  monday.setHours(0, 0, 0, 0)

  return monday
}

function createDateId(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function MealPlan() {
  const [weekStart] = useState(() => getMonday())
  const [meals, setMeals] = useState([])
  const [plan, setPlan] = useState(createEmptyPlan)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const weekId = createDateId(weekStart)

  useEffect(() => {
    const mealsQuery = query(
      collection(db, "meals"),
      orderBy("name")
    )

    const unsubscribeMeals = onSnapshot(
      mealsQuery,
      (snapshot) => {
        const savedMeals = snapshot.docs.map((mealDocument) => ({
          id: mealDocument.id,
          ...mealDocument.data(),
        }))

        setMeals(savedMeals)
      },
      (firebaseError) => {
        console.error(firebaseError)
        setError("We couldn't load your meals.")
      }
    )

    const weekReference = doc(db, "weeklyPlans", weekId)

    const unsubscribePlan = onSnapshot(
      weekReference,
      (snapshot) => {
        if (snapshot.exists()) {
          setPlan({
            ...createEmptyPlan(),
            ...snapshot.data().days,
          })
        }

        setIsLoading(false)
      },
      (firebaseError) => {
        console.error(firebaseError)
        setError("We couldn't load this week's meal plan.")
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribeMeals()
      unsubscribePlan()
    }
  }, [weekId])

  function handleMealChange(day, mealId) {
    setPlan((currentPlan) => ({
      ...currentPlan,
      [day]: mealId,
    }))

    setMessage("")
  }

  async function savePlan() {
    setIsSaving(true)
    setMessage("")
    setError("")

    try {
      await setDoc(doc(db, "weeklyPlans", weekId), {
        weekStart: weekId,
        days: plan,
        updatedAt: serverTimestamp(),
      })

      setMessage("Your meal plan has been saved.")
    } catch (firebaseError) {
      console.error(firebaseError)
      setError("We couldn't save your meal plan. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main>
      <section className="page-heading">
        <h1>Weekly Meal Plan</h1>
        <p>Week of {formatDate(weekStart)}</p>
      </section>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}

      {isLoading ? (
        <p>Loading your meal plan...</p>
      ) : meals.length === 0 ? (
        <section className="card">
          <h2>No meals available</h2>
          <p>Add some meals to your Meal Bank before planning your week.</p>
        </section>
      ) : (
        <>
          <section className="meal-plan-grid">
            {DAYS.map((day, index) => {
              const date = new Date(weekStart)
              date.setDate(weekStart.getDate() + index)

              return (
                <article className="card day-card" key={day}>
                  <div className="day-heading">
                    <h2>{day}</h2>
                    <span>{formatDate(date)}</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`meal-${day}`}>Meal</label>

                    <select
                      id={`meal-${day}`}
                      value={plan[day]}
                      onChange={(event) =>
                        handleMealChange(day, event.target.value)
                      }
                    >
                      <option value="">No meal planned</option>

                      {meals.map((meal) => (
                        <option value={meal.id} key={meal.id}>
                          {meal.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              )
            })}
          </section>

          <button
            className="button button-primary save-plan-button"
            type="button"
            onClick={savePlan}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save meal plan"}
          </button>
        </>
      )}
    </main>
  )
}

export default MealPlan