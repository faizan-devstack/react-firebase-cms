import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database'
import { app } from './firebase'

const db = getDatabase(app)
const auth = getAuth(app)

function App() {

  const signupUser = () => {
    createUserWithEmailAndPassword(auth, 'faizan.devstack@gmail.com', 'password123').then((value) => console.log(value))
  }

  const putData = () => {
    set(ref(db, 'users/faizan'), {
      id: 1,
      name: 'Muhammad Faizan',
      age: 21,
    });
  };

  return (
    <div className='flex flex-col justify-center min-h-screen items-center'>
      <h1 className=''>Firebase React App</h1>
      <button onClick={putData}>Put Data</button>
      <button onClick={signupUser}>Signup User</button>
    </div>
  )
}

export default App
