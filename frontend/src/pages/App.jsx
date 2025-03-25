import React from "react";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import Background from "./components/Background";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import cj from "../../public/cj.webp";
import big from "../../public/big_smoke.webp";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faCoffee,
  faCartShopping,
  faDollarSign,
  faRecycle,
  faChartSimple,
  faRankingStar,
  faEarthAmericas,
} from "@fortawesome/free-solid-svg-icons";

const WelcomeText = () => {
  return (
    <motion.h1
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{
        delay: 1,
        duration: 1.5,
        opacity: { duration: 1 },
        filter: { duration: 2 },
      }}
    >
      <TypeAnimation
        sequence={[
          "Welcome to Eco Elo!",
          1000,
          "The future of shopping green.",
          1000,
        ]}
        speed={50}
        repeat={Infinity}
      />
    </motion.h1>
  );
};

const App = () => {
  return (
    <div>
      <Nav />
      {/* ADC BEST APP */}
      <div className="app-header">
        <WelcomeText />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="app-description"
        >
          Compete with users to become more mindful about your environmental
          impact to become number one!
        </motion.div>
      </div>
      {/* stupid cube starts */}
      <div className="stage-cube">
        <div className="cube-spinner">
          <div className="face1">
            <FontAwesomeIcon icon={faLeaf} color="#a4b0a7" />
          </div>
          <div className="face2">
            <FontAwesomeIcon icon={faCartShopping} color="#b8c2bc" />
          </div>
          <div className="face3">
            <FontAwesomeIcon icon={faDollarSign} color="#c1d6c6" />
          </div>
          <div className="face4">
            <FontAwesomeIcon icon={faRecycle} color="#d2e1d6" />
          </div>
          <div className="face5">
            <FontAwesomeIcon icon={faRankingStar} color="#b8c2bc" />
          </div>
          <div className="face6">
            <FontAwesomeIcon icon={faEarthAmericas} color="#c1d6c6" />
          </div>
        </div>
      </div>
      {/* stupid cube ends */}

      <div className="glass-section">
        {/* What We Do Section */}
        <section id="what-we-do" className="section">
          <h2>What We Do</h2>
          <p>
            We specialize in providing innovative solutions that help businesses
            grow and succeed in their respective industries.
          </p>
        </section>
        {/* Who We Are Section */}
        <section id="who-we-are" className="section">
          <h2>Who We Are</h2>
          <p>
            We are a team of dedicated professionals committed to delivering
            high-quality products and services to our customers.
          </p>
        </section>

        {/* About the Product Section */}
        <section id="about-the-product" className="section">
          <h2>About the Product</h2>
          <p>
            Our product is designed to meet the needs of modern businesses,
            offering a range of features that enhance productivity and
            efficiency.
          </p>
          <div className="product-images">
            <img
              src={cj}
              alt="Product Image 1"
              className="product-image"
            />
            <img
              src={big}
              alt="Product Image 2"
              className="product-image"
            />
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact-us" className="section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions or would like to learn more about our
            products and services, please don't hesitate to contact us.
          </p>
          <form className="contact-form">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" required />
            <div className="warning-message" id="name-warning">
              Please enter your name.
            </div>

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />
            <div className="warning-message" id="email-warning">
              Please enter a valid email address.
            </div>

            <label htmlFor="message">Message:</label>
            <textarea id="message" name="message" required></textarea>
            <div className="warning-message" id="message-warning">
              Please enter a message.
            </div>

            <button type="submit">Submit</button>
          </form>
        </section>
      </div>

      <Footer />
      <Background />
    </div>
  );
};

export default App;
