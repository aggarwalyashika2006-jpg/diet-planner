import { useState, useEffect } from "react";
import { db, auth, messaging } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getToken } from "firebase/messaging";

function App() {
  // ===== App States =====
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("");
  const [goal, setGoal] = useState("");
  const [dietPref, setDietPref] = useState("");
  const [allergies, setAllergies] = useState("");
  const [budget, setBudget] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [timeline, setTimeline] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [diet, setDiet] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  // 🍎 Food Database
  const foodData = { rice: 200, roti: 100, milk: 150, egg: 70, apple: 80, banana: 100 };
  const [food, setFood] = useState("");
  const [intakeList, setIntakeList] = useState([]);
  const [totalIntake, setTotalIntake] = useState(0);

  // ===== Keep user logged in =====
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) saveFCMToken(currentUser.uid);
    });
    return () => unsubscribe();
  }, []);

  // ===== Save FCM token for notifications =====
  const saveFCMToken = async (uid) => {
    try {
      const token = await getToken(messaging, { vapidKey: "BP1AuBbZXzsMQWYxBnrrh8CQjc2x0UF2HiwffLB6ln78_VULTEq9mmOiEN45ejJWV3OWrGllVwKFkMa7cTWtILc	" });
      if (token) {
        await setDoc(doc(db, "fcmTokens", uid), { token }, { merge: true });
      }
    } catch (err) {
      console.error("FCM token error:", err);
    }
  };

  // ===== Functions =====
  const calculateCalories = () => {
    if (!age || !height || !weight || !sex) return alert("Fill basic details first");
    let bmr = sex.toLowerCase() === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    setCalories(Math.round(bmr));
    setProtein(Math.round((0.3 * bmr) / 4));
    setCarbs(Math.round((0.4 * bmr) / 4));
    setFat(Math.round((0.3 * bmr) / 9));
  };

  const generateDiet = () => {
    if (!calories) return alert("Calculate calories first");
    if (calories < 1500) setDiet("Breakfast: Oats 🥣 | Lunch: Salad 🥗 | Dinner: Soup 🍲");
    else if (calories < 2000) setDiet("Breakfast: Eggs 🍳 | Lunch: Roti + Sabzi 🍛 | Dinner: Rice + Dal 🍚");
    else setDiet("Breakfast: Paratha 🫓 | Lunch: Paneer + Roti 🧀 | Dinner: Chicken + Rice 🍗");
  };

  const generateRecommendation = () => {
    if (!calories) return alert("Calculate calories first");
    let message = "";
    message += goal.toLowerCase() === "loss" ? "👉 Maintain calorie deficit\n"
             : goal.toLowerCase() === "gain" ? "👉 Increase calorie intake\n"
             : "👉 Maintain current diet\n";
    message += totalIntake > calories ? "⚠️ Overeating\n" : "🍽️ Eat more\n";
    message += dietPref.toLowerCase() === "veg" ? "🥗 Eat paneer, dal\n" : "🍗 Eat eggs, chicken\n";
    message += activity.toLowerCase() === "sedentary" ? "🏃 Start walking\n" : "💪 Keep exercising\n";
    setRecommendation(message);
  };

  const suggestRecipe = () => {
    let recipe = dietPref.toLowerCase() === "veg"
      ? cuisine.toLowerCase() === "indian" ? "Paneer + Roti 🍛" : "Veg Noodles 🍜"
      : cuisine.toLowerCase() === "indian" ? "Chicken + Rice 🍗" : "Grilled Chicken 🍖";
    if (allergies.toLowerCase().includes("peanut")) recipe += " (No peanut)";
    setRecommendation(prev => prev + "\n🍽️ " + recipe);
  };

  const addFood = () => {
    const cal = foodData[food.toLowerCase()];
    if (!cal) return alert("Food not found");
    setIntakeList([...intakeList, { name: food, calories: cal }]);
    setTotalIntake(totalIntake + cal);
    setFood("");
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      await saveFCMToken(userCredential.user.uid);
      alert("Signup Successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      await saveFCMToken(userCredential.user.uid);
      alert("Login Successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      alert("Logged out!");
    } catch (error) {
      alert(error.message);
    }
  };

  const saveData = async () => {
    if (!user) return alert("Login first!");
    try {
      await setDoc(doc(db, "users", user.uid), {
        name, age, sex, height, weight, activity, goal, dietPref, allergies,
        budget, cuisine, timeline, imageURL, calories, protein, carbs, fat,
        diet, intakeList, totalIntake, recommendation
      });
      alert("Saved!");
    } catch (error) {
      console.log(error);
      alert("Error saving");
    }
  };

  // ===== Render =====
  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Diet Planner</h1>

      {!user ? (
        <div style={{ marginBottom: "20px" }}>
          <h2>Login / Sign Up</h2>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br /><br />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br /><br />
          <button onClick={handleSignUp}>Sign Up</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h2>Welcome, {user.email}</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <input placeholder="Name" onChange={(e) => setName(e.target.value)} /><br /><br />
          <input placeholder="Age" onChange={(e) => setAge(e.target.value)} /><br /><br />
          <input placeholder="Sex" onChange={(e) => setSex(e.target.value)} /><br /><br />
          <input placeholder="Height" onChange={(e) => setHeight(e.target.value)} /><br /><br />
          <input placeholder="Weight" onChange={(e) => setWeight(e.target.value)} /><br /><br />
          <input placeholder="Activity" onChange={(e) => setActivity(e.target.value)} /><br /><br />
          <input placeholder="Goal" onChange={(e) => setGoal(e.target.value)} /><br /><br />
          <input placeholder="Diet Preference" onChange={(e) => setDietPref(e.target.value)} /><br /><br />
          <input placeholder="Allergies" onChange={(e) => setAllergies(e.target.value)} /><br /><br />
          <input placeholder="Budget" onChange={(e) => setBudget(e.target.value)} /><br /><br />
          <input placeholder="Cuisine" onChange={(e) => setCuisine(e.target.value)} /><br /><br />
          <input placeholder="Timeline" onChange={(e) => setTimeline(e.target.value)} /><br /><br />
          <input placeholder="Photo name" onChange={(e) => setImageURL(e.target.value)} /><br /><br />

          <button onClick={calculateCalories}>Calculate</button>
          <button onClick={generateDiet}>Diet</button>
          <button onClick={generateRecommendation}>AI</button>
          <button onClick={suggestRecipe}>Recipe</button>

          <h2>Calories: {calories}</h2>
          <h3>Protein: {protein}</h3>
          <h3>Carbs: {carbs}</h3>
          <h3>Fat: {fat}</h3>
          <h3>{diet}</h3>
          <h3 style={{ whiteSpace: "pre-line" }}>{recommendation}</h3>

          <hr />

          <input value={food} onChange={(e) => setFood(e.target.value)} placeholder="Food" />
          <button onClick={addFood}>Add</button>

          <h3>Total Intake: {totalIntake}</h3>
          <ul>
            {intakeList.map((item, i) => (
              <li key={i}>{item.name} - {item.calories}</li>
            ))}
          </ul>

          <button onClick={saveData}>Save</button>
        </>
      )}
    </div>
  );
}

export default App;