const hlk_args_t hlk_args = {
.block_tile_dim = 2,
.block_cnt = 8,
.batch_cnt = 1,
.num_m_sub_blocks = 4,
.num_n_sub_blocks = 2,
.num_tiles_per_m_sub_block = 1,
.num_tiles_per_n_sub_block = 2,
.gradient_op = 0,
.transpose = 0,
.zero_point = 0,
.is_32bit_dest_en = 0,
};
