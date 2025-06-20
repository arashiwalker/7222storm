import React, { useEffect, useRef, useState } from 'react';
  import { StyleSheet, Text, View } from 'react-native';
  import Canvas from 'react-native-canvas';

  export default function ClockScreen() {
    const canvasRef = useRef(null);
    const [time, setTime] = useState({ huor: 0, minit: 0, mirtha: 0 });

    const updateTime = () => {
      const now = Date.now() / 1000;
      const totalMirthas = now / (72 / 22);
      const mirtha = Math.floor(totalMirthas % 22);
      const totalMinits = totalMirthas / 22;
      const minit = Math.floor(totalMinits % 50);
      const huor = Math.floor(totalMinits / 50);
      setTime({ huor, minit, mirtha });
    };

    const drawClock = async (canvas) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 300;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(150, 150, 140, 0, 2 * Math.PI);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.stroke();

        const mirthaAngle = (time.mirtha / 22) * 2 * Math.PI - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(150 + 100 * Math.cos(mirthaAngle), 150 + 100 * Math.sin(mirthaAngle));
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };

    useEffect(() => {
      const interval = setInterval(() => {
        updateTime();
        if (canvasRef.current) {
          drawClock(canvasRef.current);
        }
      }, 100);
      return () => clearInterval(interval);
    }, [time]);

    return (
      <View style={styles.container}>
        <Canvas ref={canvasRef} style={styles.canvas} />
        <View style={styles.digitalClock}>
          <Text style={styles.timeText}>
            {String(time.huor).padStart(2, '0')}:
            <Text style={styles.minitText}>{String(time.minit).padStart(2, '0')}</Text>:
            {String(time.mirtha).padStart(2, '0')}
          </Text>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    canvas: {
      width: 300,
      height: 300,
    },
    digitalClock: {
      marginTop: 20,
    },
    timeText: {
      fontSize: 40,
      fontWeight: 'bold',
    },
    minitText: {
      color: '#210059', // Deep blue violet for Minit
      fontSize: 40,
      fontWeight: 'bold',
    },
  });