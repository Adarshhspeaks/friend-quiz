# Trust Me? — friend quiz app

React + Vite frontend, Express + SQLite backend.

## Run it
```
npm run install:all
npm run dev        # api on :3001, web on :5173
```
Open http://localhost:5173

## Production
```
npm run build      # builds client/dist
npm start          # Express serves API + built site on :3001
```
Deploy on Render/Railway. Set `DB_PATH` to a persistent disk path (e.g. /data/quiz.db) so quizzes survive restarts.

## API
- POST /api/quizzes
- GET  /api/quizzes/:id
- POST /api/quizzes/:id/responses
- GET  /api/quizzes/:id/results
