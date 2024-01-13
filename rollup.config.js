import resolve from 'rollup-plugin-node-resolve';
import html from 'rollup-plugin-html';

export default {
    input: 'index.html', // Entry point of your application
    output: {
        file: 'dist/bundle.js', //
        format: 'esm', // You can change the format based on your needs (umd, cjs, esm)
    },
    plugins: [
        resolve(),
        html()
    ],
};