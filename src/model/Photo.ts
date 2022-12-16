import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
  source: {
    type: String,
    required: true,
  }
});

export const Photo = mongoose.model('photos', PhotoSchema);










export const test = [{
  "author": "adarkin0",
  "title": "Tom & Thomas",
  "description": "Nulla tellus. In sagittis dui vel nisl.",
  "source": "5.jpg",
  "categories": [
    "cat",
  ]
}, {
  "author": "wsweetnam1",
  "title": "Warm December, A",
  "description": "Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo.",
  "source": "2.jpg",
  "categories": [
    "cat",
  ]
}, {
  "author": "kdellenbroker2",
  "title": "Bourne Ultimatum, The",
  "description": "In quis justo.",
  "source": "1.jpg",
  "categories": [
    "cat",
    "funny"
  ]
}, {
  "author": "rcoard3",
  "title": "Eight Crazy Nights (Adam Sandler's Eight Crazy Nights)",
  "description": "Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem.",
  "source": "2.jpg",
  "categories": [
    "cat",
    "funny"
  ]
}, {
  "author": "drhodef4",
  "title": "Tammy and the T-Rex",
  "description": "Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.",
  "source": "4.jpg",
  "categories": [
    "cat",
  ]
}, {
  "author": "mdeer5",
  "title": "Go, Go Second Time Virgin (Yuke yuke nidome no shojo)",
  "description": "In hac habitasse platea dictumst.",
  "source": "3.jpg",
  "categories": [
    "cat",
    "funny"
  ]
}, {
  "author": "ehatz6",
  "title": "Attraction",
  "description": "Vestibulum rutrum rutrum neque.",
  "source": "5.jpg",
  "categories": [
    "cat",
  ]
}, {
  "author": "gpadula7",
  "title": "Wedding Party, The (Die Bluthochzeit)",
  "description": "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.",
  "source": "5.jpg",
  "categories": [
    "cat",
  ]
}, {
  "author": "lcoalbran8",
  "title": "Calling, The",
  "description": "In hac habitasse platea dictumst.",
  "source": "1.jpg",
  "categories": [
    "cat",
    "funny"
  ]
}, {
  "author": "gwagge9",
  "title": "Emmet Otter's Jug-Band Christmas",
  "description": "Aliquam erat volutpat. In congue. Etiam justo.",
  "source": "5.jpg",
  "categories": [
    "cat",
    "funny"
  ]
}, {
  "author": "jcopasa",
  "title": "O Panishyros Megistanas Ton Ninja",
  "description": "Donec quis orci eget orci vehicula condimentum. Curabitur in libero ut massa volutpat convallis.",
  "source": "2.jpg",
  "categories": [
    "cat",
    "funny"
  ]
}, {
  "author": "mcurranb",
  "title": "Swordfish",
  "description": "Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit.",
  "source": "5.jpg",
  "categories": [
    "cat",
    "funny"
  ]
}, {
  "author": "rdeeganc",
  "title": "Fifth Estate, The",
  "description": "Ut tellus. Nulla ut erat id mauris vulputate elementum. Nullam varius.",
  "source": "5.jpg",
  "categories": [
    "cat",
  ]
}, {
  "author": "vpowdrilld",
  "title": "Naked Blood: Megyaku (Nekeddo burâddo: Megyaku)",
  "description": "Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.",
  "source": "5.jpg",
  "categories": [
    "cat",
    "funny"
  ]
}, {
  "author": "rtrewarthae",
  "title": "Milk and Honey",
  "description": "Morbi non lectus.",
  "source": "1.jpg",
  "categories": [
    "cat",
  ]
}]
