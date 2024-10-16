import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created,
                isComplete: false // default todo's to incomplete
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    // This handles the retrieval of the user's todo list
    router.get('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            let todosList = await todoRepository.findByUserId(session.userID);
            return res.status(200).send( {todosList} );
        } catch (err) {
            console.error(err);
            return res.status(500).send({error: "Retrieving list of Todos failed."})
        }
    });

    // This handles the status OR name updates (since we only do one at a time)
    router.patch('/:id', auth, async (req, res) => {
        try {
            const { id } = req.params;
            const { isComplete, name } = req.body;

            const updatedData = {};
            if (isComplete !== undefined) {
                updatedData.isComplete = isComplete; // Only update the status if provided
            }
            if (name) {
                updatedData.name = name; // Only update the name if provided
            }
            
            const updated = await todoRepository.update(id, updatedData);
            return res.status(200).send(updated); 
        } catch (err) {
            console.error(err);
            return res.status(500).send({error: "Updating status of Todo failed."})
        }
    });

    return router;
}
