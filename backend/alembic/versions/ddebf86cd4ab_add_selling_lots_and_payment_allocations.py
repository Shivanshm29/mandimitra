"""add_selling_lots_and_payment_allocations

Revision ID: ddebf86cd4ab
Revises: 3d4acb6cb84c
Create Date: 2026-11-03 20:25:59.653865

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ddebf86cd4ab'
down_revision: Union[str, Sequence[str], None] = '3d4acb6cb84c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('sales', schema=None) as batch_op:
        batch_op.create_foreign_key('fk_sales_lot_id', 'selling_lots', ['lot_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('sales', schema=None) as batch_op:
        batch_op.drop_constraint('fk_sales_lot_id', type_='foreignkey')
