"""create scans table

Revision ID: 003
Revises: 002
Create Date: 2026-09-26 13:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'scans',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('image_data', sa.Text(), nullable=False),
        sa.Column('item_name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('subtype', sa.String(length=100), nullable=True),
        sa.Column('stream', sa.String(length=100), nullable=True),
        sa.Column('confidence', sa.Integer(), nullable=False, server_default='90'),
        sa.Column('circularity_score', sa.Integer(), nullable=False, server_default='85'),
        sa.Column('suggested_actions', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_scans_user_id'), 'scans', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_scans_user_id'), table_name='scans')
    op.drop_table('scans')
