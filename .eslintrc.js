module.exports = {
    parser: "@typescript-eslint/parser",
    env: {
        "es2021": true,
        "node": true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        "prettier"
    ],
    parserOptions: {
        ecmaVersion: "latest",
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json']
    },
    rules: {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
}
