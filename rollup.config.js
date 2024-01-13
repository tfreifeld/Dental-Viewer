import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'js/AppManager.js', // Entry point of your application
    output: {
        file: 'dist/bundle.js', //
        format: 'esm', // You can change the format based on your needs (umd, cjs, esm)
    },
    plugins: [
        resolve()
    ],
};