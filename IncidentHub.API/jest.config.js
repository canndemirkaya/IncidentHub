module.exports = {
    preset: 'ts-jest',
    roots: ['<rootDir>/src', '<rootDir>/test'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec|e2e))\\.tsx?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testTimeout: 20000,
};
