var index = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <title>Clevaligner Test</title>\r\n    <script type=\"importmap\">\r\n        {\r\n            \"imports\": {\r\n                \"lil-gui\": \"./node_modules/lil-gui/dist/lil-gui.esm.js\",\r\n                \"three\": \"./node_modules/three/build/three.module.js\",\r\n                \"three/examples/jsm/loaders/GLTFLoader\": \"./node_modules/three/examples/jsm/loaders/GLTFLoader.js\",\r\n                \"three/examples/jsm/controls/OrbitControls\": \"./node_modules/three/examples/jsm/controls/OrbitControls.js\",\r\n                \"three/examples/jsm/controls/TransformControls\": \"./node_modules/three/examples/jsm/controls/TransformControls.js\",\r\n                \"three-mesh-bvh\": \"./node_modules/three-mesh-bvh/build/index.module.js\"\r\n            }\r\n        }\r\n    </script>\r\n    <script src=\"build/SceneController.js\" type=\"module\"></script>\r\n    <script src=\"build/AppManager.js\" type=\"module\"></script>\r\n\r\n    <style>\r\n        body {\r\n            position: relative;\r\n            height: 100vh;\r\n            margin: 0;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n        }\r\n\r\n        .center-button {\r\n            position: absolute;\r\n            top: 50%;\r\n            left: 50%;\r\n            transform: translate(-50%, -50%);\r\n            padding: 15px 30px;\r\n            background-color: #3498db;\r\n            color: #fff;\r\n            border: none;\r\n            border-radius: 5px;\r\n            cursor: pointer;\r\n            font-size: 18px;\r\n            font-family: 'Arial', sans-serif;\r\n        }\r\n\r\n        .center-button:hover {\r\n            background-color: #2980b9;\r\n        }\r\n\r\n        label {\r\n            position: absolute;\r\n            top: 10px;\r\n            left: 20px;\r\n            z-index: 1;\r\n            display: none;\r\n        }\r\n\r\n        .constant-controller {\r\n            opacity: 1.0 !important;\r\n        }\r\n\r\n    </style>\r\n\r\n</head>\r\n<body>\r\n<label for=\"orbit-controls-toggle\">\r\n    Orbit Controls\r\n    <input type=\"checkbox\" id=\"orbit-controls-toggle\" checked=\"checked\">\r\n</label>\r\n<button class=\"center-button\" id=\"load-button\">Load</button>\r\n<script type=\"module\">\r\n    import {AppManager} from './build/AppManager.js';\r\n\r\n    window[\"app\"] = new AppManager();\r\n</script>\r\n</body>\r\n</html>";

export { index as default };