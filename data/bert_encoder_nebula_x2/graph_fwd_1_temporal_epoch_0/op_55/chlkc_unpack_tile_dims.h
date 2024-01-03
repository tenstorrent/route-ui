constexpr std::uint32_t unpack_tile_dims[24][2] = {
{32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, // Input Buffers
{32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, // Param Buffers
{32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, // Intermed Buffers
};

constexpr std::uint32_t unpack_tile_num_faces[24] = {
4, 4, 4, 4, 4, 4, 4, 4, // Input Buffers
4, 4, 4, 4, 4, 4, 4, 4, // Param Buffers
4, 4, 4, 4, 4, 4, 4, 4, // Intermed Buffers
};

constexpr std::uint32_t unpack_tile_face_r_dim[24] = {
16, 16, 16, 16, 16, 16, 16, 16, // Input Buffers
16, 16, 16, 16, 16, 16, 16, 16, // Param Buffers
16, 16, 16, 16, 16, 16, 16, 16, // Intermed Buffers
};

constexpr bool unpack_partial_face[24] = {
0, 0, 0, 0, 0, 0, 0, 0, // Input Buffers
0, 0, 0, 0, 0, 0, 0, 0, // Param Buffers
0, 0, 0, 0, 0, 0, 0, 0, // Intermed Buffers
};

constexpr bool unpack_narrow_tile[24] = {
0, 0, 0, 0, 0, 0, 0, 0, // Input Buffers
0, 0, 0, 0, 0, 0, 0, 0, // Param Buffers
0, 0, 0, 0, 0, 0, 0, 0, // Intermed Buffers
};

constexpr std::uint32_t unpack_tile_sizes[24] = {
2080, 32, 32, 32, 32, 32, 32, 32, // Input Buffers
32, 32, 32, 32, 32, 32, 32, 32, // Param Buffers
32, 32, 32, 32, 32, 32, 32, 32, // Intermed Buffers
};

