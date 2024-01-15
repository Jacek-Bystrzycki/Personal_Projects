import { Router } from 'express';
import { addItem, getAllItems, clearItems, updateItem, removeItem } from '../controller/item-controller';

const router: Router = Router();

router.get('/', getAllItems);
router.post('/', addItem);
router.delete('/', clearItems);
router.put('/:_id', updateItem);
router.delete('/:_id', removeItem);

export { router };
