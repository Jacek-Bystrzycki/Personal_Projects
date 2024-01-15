import express, { Express, Request, Response } from 'express';
import Item from '../model/Item';
import { ItemInterface } from '../model/Item';
import { isItemInterface, isItemInterfaceArray } from '../utils/check-types';
import { log } from 'console';

export const getAllItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: unknown = await Item.find();

    if (!isItemInterfaceArray(data)) {
      res.status(200).json([]);
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  const data: unknown = req.body;
  try {
    if (!isItemInterface(data)) throw new Error('Wrong data from Frontend!!');
    const newData = await Item.create(data);
    if (!isItemInterface(newData)) throw new Error('Wrong data from Frontend!!');
    res.status(200).json(newData);
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: 'Bad Request!!' });
  }
};
export const clearItems = async (req: Request, res: Response): Promise<void> => {
  try {
    await Item.deleteMany({});
    res.status(200).json({ message: 'cleared' });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: 'Bad Request!!' });
  }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const data = req.params;
  const { title, checked } = req.body;
  if (!data?._id) throw new Error('Bad Request');
  await Item.findByIdAndUpdate(data._id, { title, checked });
  res.status(200).json({ message: 'OK' });
  try {
  } catch (error) {
    res.status(404).send(error);
  }
};

export const removeItem = async (req: Request, res: Response): Promise<void> => {
  const data = req.params;
  try {
    await Item.findByIdAndDelete(data._id);
    res.status(200).json({ message: 'OK' });
  } catch (error) {
    res.status(404).send(error);
  }
};
