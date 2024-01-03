constexpr std::uint32_t pack_tile_dims[16][2] = {
{32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, // Output Buffers
{32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, {32, 32}, // Intermed Buffers
};

constexpr std::uint32_t pack_tile_num_faces[16] = {
4, 4, 4, 4, 4, 4, 4, 4, // Output Buffers
4, 4, 4, 4, 4, 4, 4, 4, // Intermed Buffers
};

constexpr std::uint32_t pack_tile_face_r_dim[16] = {
16, 16, 16, 16, 16, 16, 16, 16, // Output Buffers
16, 16, 16, 16, 16, 16, 16, 16, // Intermed Buffers
};

constexpr bool pack_partial_face[16] = {
0, 0, 0, 0, 0, 0, 0, 0, // Output Buffers
0, 0, 0, 0, 0, 0, 0, 0, // Intermed Buffers
};

constexpr bool pack_narrow_tile[16] = {
0, 0, 0, 0, 0, 0, 0, 0, // Output Buffers
0, 0, 0, 0, 0, 0, 0, 0, // Intermed Buffers
};

constexpr std::uint32_t pack_tile_sizes[16] = {
2080, 32, 32, 32, 32, 32, 32, 32, // Output Buffers
2080, 32, 32, 32, 32, 32, 32, 32, // Intermed Buffers
};

