const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TripProgramSchema = new Schema({
    start_point: {
        type: Schema.Types.ObjectId,
        ref: 'Landmark',
        required: 'Start point is required'
    },
    end_point: {
        type: Schema.Types.ObjectId,
        ref: 'Landmark',
        required: 'End point is required'
    },
    stops: {
        type: [Schema.Types.ObjectId],
        ref: 'Landmark'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

TripProgramSchema.set('toJSON', { getters: true, virtuals: true });
mongoose.model('TripProgram', TripProgramSchema);