import React, { useEffect, useState } from "react";
import Sketch from "react-p5";

const Background = () => {
  const [scrollY, setScrollY] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("#F0F0F0");
  const [nodes, setNodes] = useState([]);
  const [draggingNode, setDraggingNode] = useState(null);
  const [prevMouseX, setPrevMouseX] = useState(null);
  const [prevMouseY, setPrevMouseY] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Update background color based on scroll position
      const pastelColors = ["#F0F0F0", "#a4b0a7", "#c1d6c6", "#a8ffbd"];
      const colorIndex = Math.floor(window.scrollY / 500) % pastelColors.length;
      const nextColorIndex = (colorIndex + 1) % pastelColors.length;
      const lerpAmount = (window.scrollY % 500) / 500;

      const color1 = pastelColors[colorIndex];
      const color2 = pastelColors[nextColorIndex];
      const lerpedColor = lerpColor(color1, color2, lerpAmount);

      setBackgroundColor(lerpedColor);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Initialize nodes
    const initialNodes = [];
    for (let i = 0; i < 20; i++) {
      initialNodes.push({
        x: Math.random() * window.innerWidth, // Full width of the screen
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5, // Slower velocity
        vy: (Math.random() - 0.5) * 0.5, // Slower velocity
        isDragging: false,
      });
    }
    setNodes(initialNodes);
  }, []);

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
  };

  const draw = (p5) => {
    p5.background(255);

    const pastelColors = ["#F0F0F0", "#a4b0a7", "#c1d6c6", "#a8ffbd"];
    const colorIndex = Math.floor(scrollY / 500) % pastelColors.length;
    const nextColorIndex = (colorIndex + 1) % pastelColors.length;
    const lerpAmount = (scrollY % 500) / 500;

    const color1 = p5.color(pastelColors[colorIndex]);
    const color2 = p5.color(pastelColors[nextColorIndex]);
    const lerpedColor = p5.lerpColor(color1, color2, lerpAmount);

    p5.stroke(lerpedColor);
    p5.strokeWeight(2); // Thicker lines
    p5.fill(lerpedColor);

    // Update and draw nodes
    nodes.forEach((node, index) => {
      if (!node.isDragging) {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > p5.width) node.vx *= -1;
        if (node.y < 0 || node.y > p5.height) node.vy *= -1;
      }

      // Draw node
      p5.ellipse(node.x, node.y, 20, 20); // Bigger nodes

      // Draw edges
      for (let j = index + 1; j < nodes.length; j++) {
        const otherNode = nodes[j];
        const distance = p5.dist(node.x, node.y, otherNode.x, otherNode.y);
        if (distance < 200) {
          // Increased distance for drawing edges
          p5.line(node.x, node.y, otherNode.x, otherNode.y);
        }
      }
    });
  };

  const mousePressed = (p5) => {
    nodes.forEach((node) => {
      const distance = p5.dist(p5.mouseX, p5.mouseY, node.x, node.y);
      if (distance < 10) {
        node.isDragging = true;
        setDraggingNode(node);
        setPrevMouseX(p5.mouseX);
        setPrevMouseY(p5.mouseY);
      }
    });
  };

  const mouseDragged = (p5) => {
    if (draggingNode) {
      const dx = p5.mouseX - prevMouseX;
      const dy = p5.mouseY - prevMouseY;

      draggingNode.x = p5.mouseX;
      draggingNode.y = p5.mouseY;
      draggingNode.vx = dx * 0.1; // Adjust the multiplier to control the speed
      draggingNode.vy = dy * 0.1; // Adjust the multiplier to control the speed

      setPrevMouseX(p5.mouseX);
      setPrevMouseY(p5.mouseY);
    }
  };

  const mouseReleased = () => {
    if (draggingNode) {
      draggingNode.isDragging = false;
      setDraggingNode(null);
      setPrevMouseX(null);
      setPrevMouseY(null);
    }
  };

  const lerpColor = (color1, color2, amount) => {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * amount);
    const g = Math.round(g1 + (g2 - g1) * amount);
    const b = Math.round(b1 + (b2 - b1) * amount);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  return (
    <div
      style={{
        position: "fixed", // Make the background fixed
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -2,
        backgroundColor: backgroundColor, // Apply the background color
        transition: "background-color 0.5s ease", // Smooth transition
      }}
    >
      <Sketch
        setup={setup}
        draw={draw}
        mousePressed={mousePressed}
        mouseDragged={mouseDragged}
        mouseReleased={mouseReleased}
      />
    </div>
  );
};

export default Background;
