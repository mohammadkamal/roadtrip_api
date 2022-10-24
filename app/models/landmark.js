const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// From google maps
const landmark_types = ['uncategorized', 'airport', 'amusement_park', 'aquarium', 'art_gallery',
    'bakery', 'book_store', 'bowling_alley', 'cafe', 'campground', 'church', 'mosque', 'movie_theater',
    'museum', 'park', 'restaurant', 'rv_park', 'shopping_mall', 'spa', 'stadium', 'store', 'supermarket',
    'synagogue', 'tourist_attraction', 'university', 'zoo'];

// From Wikipedia
const tourism_types = ['uncategorized', 'agritourism', 'archaeology', 'aqua', 'culture', 'ecotourism',
    'garden', 'geotourism', 'heritage', 'medical', 'religious', 'safari', 'space', 'sports', 'urban',
    'war', 'wellness', 'wildlife'];

let LandmarkSchema = new Schema({
    name: { type: String, required: 'Name is required' },
    coords: {
        type: Map,
        required: 'Coordinates are required',
        validate: [
            function (value) { return value.lat && value.lng; },
            'Coordinates aren\'t formatted properly'
        ]
    },
    images: { type: [String] },
    description: String,
    address: String,
    rating: Number,
    type: {
        type: String,
        enum: landmark_types,
        default: 'uncategorized'
    },
    tourism_type: {
        type: String,
        enum: tourism_types,
        default: 'uncategorized'
    },
    approvemnt: { type: Schema.Types.ObjectId, ref: 'LandmarkApprovement' },
    author: { type: Schema.Types.ObjectId, ref: 'User' }
    // TODO: Reach a decision about it
    //reviews: { type: [Schema.Types.ObjectId], ref: 'LandmarkReview' }
});

LandmarkSchema.set('toJSON', { getters: true, virtuals: true });
mongoose.model('Landmark', LandmarkSchema);