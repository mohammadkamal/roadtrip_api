const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let LandmarkApprovementSchema = new Schema({
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: 'Admin is required'
    },
    landmark: {
        type: Schema.Types.ObjectId,
        ref: 'Landmark',
        required: 'Landmark is required'
    },
    time: {
        type: Date,
        default: Date.now
    }
});

LandmarkApprovementSchema.set('toJSON', { getters: true, virtuals: true });
mongoose.model('LandmarkApprovement', LandmarkApprovementSchema);