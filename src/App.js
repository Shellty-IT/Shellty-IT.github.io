import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import CustomCursor from "./components/CustomCursor";
import CloudBackground from "./background/CloudBackground";

import './App.css';

function App() {
    return (
        <Router>
            {/* ▼ Tło WebGL — fixed, pod całą zawartością */}
            <CloudBackground />

            <CustomCursor />
            <Navbar />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/experience" element={<Experience />} />
                    <Route path="/skills" element={<Skills />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;