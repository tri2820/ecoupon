import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { Camera } from "expo-camera";
import { Challenge } from "./Challenge";

const { height, width } = Dimensions.get("window");
const screenRatio = height / width;

export function ChallengeCamera() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [desiredRatio, setDesiredRatio] = useState("16:9");
  const [challengeSizeRatio, setChallengeSizeRatio] = useState(1);
  const cameraRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const shutterEffect = () => {
    Animated.sequence([
      // @ts-ignore
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      // @ts-ignore
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    // Request permission
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      // @ts-ignore
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const setRatio = async () => {
    if (Platform.OS !== "android") return;
    // @ts-ignore
    const ratios = await cameraRef.current?.getSupportedRatiosAsync();
    // @ts-ignore
    let desiredRatio = ratios.map((r) => r.split(":")).reduce(([a, b], [c, d]) =>
      Math.abs(a / b - screenRatio) < Math.abs(c / d - screenRatio)
        ? [a, b]
        : [c, d]
    );
    setDesiredRatio(`${desiredRatio[0]}:${desiredRatio[1]}`);
  };

  const snap = async () => {
    if (cameraReady) {
      // @ts-ignore 44147937
      let photo = await cameraRef.current.takePictureAsync();
      console.log(photo);
      // shutterEffect();
    }
  }

  return (
    // @ts-ignore
    <Animated.View style={[styles.effectcontainer, { opacity: fadeAnim }]}>
      <Camera
        style={styles.camera}
        ratio={desiredRatio}
        type={Camera.Constants.Type.front}
        ref={cameraRef}
        onCameraReady={() => {
          setCameraReady(true);
          setRatio();
        }}
      >

        <View style={styles.carouselContainer}>
          {/* Carousel */}
          <ScrollView decelerationRate="fast" horizontal={true} showsHorizontalScrollIndicator={false} style={styles.carousel}
            // scrollEventThrottle={8} onScroll={(event) => {
            //   console.log('asdasd');
            //   // setChallengeSizeRatio(0.5);
            //   console.log(event.nativeEvent.contentOffset.x, event.nativeEvent.contentSize.width);
            // }}
            snapToInterval={width / 3}
          >
            {/* Padding, Android only accepts this not padding-top */}
            <View style={{ width: width / 2 - challengeSize / 2 - (width / 6 - challengeSize / 2) }}></View>
            <Challenge onPress={snap} challengeSize={challengeSize} centerLeft={fromLeft}></Challenge>
            <Challenge onPress={snap} challengeSize={challengeSize} centerLeft={fromLeft}></Challenge>
            <Challenge onPress={snap} challengeSize={challengeSize} centerLeft={fromLeft}></Challenge>
            {/* Padding, Android only accepts this not padding-top */}
            <View style={{ width: width / 2 - challengeSize / 2 - (width / 6 - challengeSize / 2) }}></View>
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          {/* Snap button border */}
          <View style={styles.button}></View>
        </View>

      </Camera>
    </Animated.View>
  );
}

const snapButtonSize = 120;
const snapButtonBorderThickness = 15;
const challengeSize = snapButtonSize - snapButtonBorderThickness * 2;
const fromLeft = (width - snapButtonSize) / 2
const paddingBottom = 20
const fromTop = height - (snapButtonSize + paddingBottom)

const styles = StyleSheet.create({
  effectcontainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
  },
  carouselContainer: {
    flex: 1,
    flexDirection: "row",
  },
  button: {
    borderRadius: Math.round((width + height) / 2),
    width: snapButtonSize,
    height: snapButtonSize,
    left: fromLeft,
    top: fromTop,
    borderWidth: snapButtonBorderThickness,
    borderColor: "white",
    backgroundColor: 'transparent'
  },
  carousel: {
    alignSelf: "flex-end",
    marginBottom: 20 + snapButtonBorderThickness
  }
});
