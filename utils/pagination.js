//  export  async function paginate(Model, req, filter = {}) {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;

//   const skip = (page - 1) * limit;

//   const [results, total] = await Promise.all([
//     Model.find(filter).skip(skip).limit(limit),
//     Model.countDocuments(filter),
//   ]);

//   const totalPages = Math.ceil(total / limit);

//   return {
//     data: results,
//     meta: {
//       page,
//       limit,
//       total,
//       totalPages,
//     },
//   };
// }

// module.exports = paginate;


// utils/paginate.js

export async function paginate(model, req, {
  searchableFields = [],
  defaultSort = '-createdAt',
  populate = null,
  staticFilter = {}
} = {}) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort || defaultSort;
  const q = req.query.q || '';

  const skip = (page - 1) * limit;

  // Construction du filtre dynamique à partir de req.query + req.params
  const filter = { ...staticFilter };

  // Ajout dynamique de tous les filtres simples (ex: ?role=manager)
  for (const [key, value] of Object.entries({ ...req.params, ...req.query })) {
    if (!['page', 'limit', 'q', 'sort'].includes(key)) {
      filter[key] = value;
    }
  }

  // Recherche textuelle (ex: q=marie)
  if (q.length > 1 && searchableFields.length > 0) {
    filter.$or = searchableFields.map(field => ({
      [field]: new RegExp(q, 'i'),
    }));
  }

  const query = model.find(filter).skip(skip).limit(limit).sort(sort);
  if (populate) query.populate(populate);

  const [results, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  return {
    data: results,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// module.exports = paginate;
