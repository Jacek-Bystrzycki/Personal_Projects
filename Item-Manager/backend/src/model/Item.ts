import { model, Schema, Model, Document } from 'mongoose';

export interface ItemInterface extends Document {
  checked: boolean;
  title: string;
}

const UserSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

export default Model<ItemInterface> = model('Item', UserSchema);
