module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\.(ts|tsx)$': ['@swc/jest', { 
      jsc: { 
        transform: { 
          react: { 
            runtime: 'automatic' 
          } 
        } 
      } 
    }],
  },
};