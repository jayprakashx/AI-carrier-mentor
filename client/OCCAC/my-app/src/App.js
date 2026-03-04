import "./App.css";
import { useState } from "react";

function App() {
  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // handle input changes
  const handleChange = (e) => {
    setFormData({ ...formdata, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // save data in localStorage
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    existingUsers.push(formdata);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    // console log the user data clearly
    console.log("✅ User Registered Successfully!");
    console.log("Name:", formdata.name);
    console.log("Email:", formdata.email);
    console.log("Password:", formdata.password);

    alert("Registration Successful!");
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <h1>Registration Form</h1>

      <label htmlFor="name">Name</label>
      <br />
      <input
        type="text"
        id="name"
        name="name"
        placeholder="Your full name"
        value={formdata.name}
        required
        onChange={handleChange}
      />
      <br />
      <br />

      <label htmlFor="email">Gmail</label>
      <br />
      <input
        type="email"
        id="email"
        name="email"
        placeholder="example@gmail.com"
        value={formdata.email}
        required
        onChange={handleChange}
      />
      <br />
      <br />

      <label htmlFor="password">Password</label>
      <br />
      <input
        type="password"
        id="password"
        name="password"
        placeholder="Choose a password"
        minLength="6"
        value={formdata.password}
        required
        onChange={handleChange}
      />
      <br />
      <br />

      <button type="submit">Submit</button>
    </form>
  );
}

export default App;