"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("src/middleware",{

/***/ "(middleware)/./src/middlewares/basic-auth.ts":
/*!***************************************!*\
  !*** ./src/middlewares/basic-auth.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   handleBasicAuth: () => (/* binding */ handleBasicAuth)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/esm/api/server.js\");\n\nfunction handleBasicAuth(request) {\n    // Disable auth in development\n    if (process.env.APP_ENV === \"development\") {\n        return null;\n    }\n    const auth = request.headers.get(\"authorization\");\n    if (auth) {\n        const authValue = auth.split(\" \")[1];\n        const [user, password] = atob(authValue).split(\":\");\n        if (user === \"admin\" && password === \"abcd1234\") {\n            return null;\n        }\n    }\n    return new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse(\"Auth required\", {\n        status: 401,\n        headers: {\n            \"WWW-Authenticate\": `Basic realm=\"Secure Area\"`\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vc3JjL21pZGRsZXdhcmVzL2Jhc2ljLWF1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBd0Q7QUFFakQsU0FBU0MsZ0JBQWdCQyxPQUFvQjtJQUNsRCw4QkFBOEI7SUFDOUIsSUFBSUMsUUFBUUMsR0FBRyxDQUFDQyxPQUFPLEtBQUssZUFBZTtRQUN6QyxPQUFPO0lBQ1Q7SUFFQSxNQUFNQyxPQUFPSixRQUFRSyxPQUFPLENBQUNDLEdBQUcsQ0FBQztJQUVqQyxJQUFJRixNQUFNO1FBQ1IsTUFBTUcsWUFBWUgsS0FBS0ksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3BDLE1BQU0sQ0FBQ0MsTUFBTUMsU0FBUyxHQUFHQyxLQUFLSixXQUFXQyxLQUFLLENBQUM7UUFFL0MsSUFBSUMsU0FBUyxXQUFXQyxhQUFhLFlBQVk7WUFDL0MsT0FBTztRQUNUO0lBQ0Y7SUFFQSxPQUFPLElBQUlaLHFEQUFZQSxDQUFVLGlCQUFpQjtRQUNoRGMsUUFBUTtRQUNSUCxTQUFTO1lBQ1Asb0JBQW9CLENBQUMseUJBQXlCLENBQUM7UUFDakQ7SUFDRjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL3NyYy9taWRkbGV3YXJlcy9iYXNpYy1hdXRoLnRzP2FkYzUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlQmFzaWNBdXRoKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIC8vIERpc2FibGUgYXV0aCBpbiBkZXZlbG9wbWVudFxuICBpZiAocHJvY2Vzcy5lbnYuQVBQX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBhdXRoID0gcmVxdWVzdC5oZWFkZXJzLmdldChcImF1dGhvcml6YXRpb25cIik7XG5cbiAgaWYgKGF1dGgpIHtcbiAgICBjb25zdCBhdXRoVmFsdWUgPSBhdXRoLnNwbGl0KFwiIFwiKVsxXTtcbiAgICBjb25zdCBbdXNlciwgcGFzc3dvcmRdID0gYXRvYihhdXRoVmFsdWUpLnNwbGl0KFwiOlwiKTtcblxuICAgIGlmICh1c2VyID09PSBcImFkbWluXCIgJiYgcGFzc3dvcmQgPT09ICdhYmNkMTIzNCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgTmV4dFJlc3BvbnNlPHVua25vd24+KFwiQXV0aCByZXF1aXJlZFwiLCB7XG4gICAgc3RhdHVzOiA0MDEsXG4gICAgaGVhZGVyczoge1xuICAgICAgXCJXV1ctQXV0aGVudGljYXRlXCI6IGBCYXNpYyByZWFsbT1cIlNlY3VyZSBBcmVhXCJgLFxuICAgIH0sXG4gIH0pO1xufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImhhbmRsZUJhc2ljQXV0aCIsInJlcXVlc3QiLCJwcm9jZXNzIiwiZW52IiwiQVBQX0VOViIsImF1dGgiLCJoZWFkZXJzIiwiZ2V0IiwiYXV0aFZhbHVlIiwic3BsaXQiLCJ1c2VyIiwicGFzc3dvcmQiLCJhdG9iIiwic3RhdHVzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./src/middlewares/basic-auth.ts\n");

/***/ })

});